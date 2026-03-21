'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { parseMermaid, generateMermaidFromPrompt, ParsedDiagram, DiagramNode, DiagramEdge, SequenceMessage } from '@/lib/mermaid-parser';
import { parsePlantUML } from '@/lib/plantuml-parser';
import { csvToMermaid } from '@/lib/csv-to-diagram';
import { useGraphicsStore, createShape, genId, Shape } from '@/store/graphics-store';
import { Code, FileText, Sparkles, Upload, Download, Table, Play, Copy, ArrowRightToLine, ChevronDown, X } from 'lucide-react';

type SyntaxMode = 'mermaid' | 'plantuml' | 'csv';

const SAMPLE_MERMAID = `flowchart TD
    A([Start]) --> B[Enter Username]
    B --> C[Enter Password]
    C --> D{Valid?}
    D -->|Yes| E[Dashboard]
    D -->|No| F[Show Error]
    F --> B
    E --> G([End])`;

const SAMPLE_PLANTUML = `@startuml
start
:Open Application;
:Login;
if (Authenticated?) then (yes)
  :Show Dashboard;
else (no)
  :Show Error;
  :Retry Login;
stop
@enduml`;

const SAMPLE_CSV = `From,To,Label
Start,Login,Begin
Login,Validate,Submit
Validate,Dashboard,Success
Validate,Error,Failure
Error,Login,Retry`;

const AI_PROMPTS = [
  'User login authentication flow',
  'Organization chart for a startup',
  'E-commerce order process',
  'REST API request sequence',
  'Database schema for users and orders',
  'Document lifecycle states',
  'Class inheritance hierarchy',
];

// SVG Rendering helpers
function getNodeCenter(node: DiagramNode): { cx: number; cy: number } {
  return { cx: node.x + node.width / 2, cy: node.y + node.height / 2 };
}

function renderNodeSVG(node: DiagramNode): React.ReactNode {
  const { x, y, width: w, height: h } = node;
  const fill = '#1e40af';
  const stroke = '#3b82f6';
  const textColor = '#e2e8f0';

  let shapeSVG: React.ReactNode;
  switch (node.shape) {
    case 'diamond':
      shapeSVG = <polygon points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`} fill={fill} stroke={stroke} strokeWidth={2} />;
      break;
    case 'circle':
      shapeSVG = <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={node.label ? fill : '#334155'} stroke={stroke} strokeWidth={2} />;
      break;
    case 'round-rect':
    case 'stadium':
      shapeSVG = <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={2} />;
      break;
    case 'cylinder':
      shapeSVG = (<g>
        <ellipse cx={x + w / 2} cy={y + 10} rx={w / 2} ry={10} fill={fill} stroke={stroke} strokeWidth={2} />
        <rect x={x} y={y + 10} width={w} height={h - 20} fill={fill} stroke="none" />
        <line x1={x} y1={y + 10} x2={x} y2={y + h - 10} stroke={stroke} strokeWidth={2} />
        <line x1={x + w} y1={y + 10} x2={x + w} y2={y + h - 10} stroke={stroke} strokeWidth={2} />
        <ellipse cx={x + w / 2} cy={y + h - 10} rx={w / 2} ry={10} fill={fill} stroke={stroke} strokeWidth={2} />
      </g>);
      break;
    case 'hexagon':
      shapeSVG = <polygon points={`${x + 20},${y} ${x + w - 20},${y} ${x + w},${y + h / 2} ${x + w - 20},${y + h} ${x + 20},${y + h} ${x},${y + h / 2}`} fill={fill} stroke={stroke} strokeWidth={2} />;
      break;
    case 'parallelogram':
      shapeSVG = <polygon points={`${x + 20},${y} ${x + w},${y} ${x + w - 20},${y + h} ${x},${y + h}`} fill={fill} stroke={stroke} strokeWidth={2} />;
      break;
    case 'entity':
      shapeSVG = (<g>
        <rect x={x} y={y} width={w} height={h} rx={4} fill={fill} stroke={stroke} strokeWidth={2} />
        <line x1={x} y1={y + 24} x2={x + w} y2={y + 24} stroke={stroke} strokeWidth={1} />
      </g>);
      break;
    default: // rect
      shapeSVG = <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={2} />;
  }

  // Label (handle multi-line for class diagrams)
  const labelLines = node.label.split('\n');
  const labelSVG = labelLines.map((line, i) => (
    <text key={i} x={x + w / 2} y={y + h / 2 + (i - (labelLines.length - 1) / 2) * 14}
      textAnchor="middle" dominantBaseline="central"
      fill={textColor} fontSize={labelLines.length > 2 ? 10 : 12} fontFamily="system-ui, sans-serif">
      {line.length > 18 ? line.slice(0, 16) + '..' : line}
    </text>
  ));

  return <g key={node.id}>{shapeSVG}{labelSVG}</g>;
}

function renderEdgeSVG(edge: DiagramEdge, nodes: DiagramNode[]): React.ReactNode {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;

  const from = getNodeCenter(fromNode);
  const to = getNodeCenter(toNode);

  // Calculate edge points on node boundaries
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const angle = Math.atan2(dy, dx);

  const startX = from.cx + Math.cos(angle) * (fromNode.width / 2);
  const startY = from.cy + Math.sin(angle) * (fromNode.height / 2);
  const endX = to.cx - Math.cos(angle) * (toNode.width / 2);
  const endY = to.cy - Math.sin(angle) * (toNode.height / 2);

  const strokeDash = edge.style === 'dashed' ? '6,4' : edge.style === 'dotted' ? '2,4' : undefined;
  const strokeWidth = edge.style === 'thick' ? 3 : 1.5;
  const markerId = edge.arrowHead ? 'arrowhead' : undefined;

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <g key={`${edge.from}-${edge.to}-${edge.label}`}>
      <line x1={startX} y1={startY} x2={endX} y2={endY}
        stroke="#60a5fa" strokeWidth={strokeWidth} strokeDasharray={strokeDash}
        markerEnd={markerId ? 'url(#arrowhead)' : undefined} />
      {edge.label && (
        <g>
          <rect x={midX - edge.label.length * 3.5 - 4} y={midY - 9} width={edge.label.length * 7 + 8} height={18} rx={3} fill="#0f172a" stroke="#334155" strokeWidth={1} />
          <text x={midX} y={midY} textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize={10} fontFamily="system-ui, sans-serif">{edge.label}</text>
        </g>
      )}
    </g>
  );
}

function renderSequenceSVG(diagram: ParsedDiagram): React.ReactNode {
  const { nodes, sequences = [] } = diagram;
  if (nodes.length === 0) return null;

  const totalHeight = 100 + sequences.length * 50 + 60;
  const elements: React.ReactNode[] = [];

  // Draw participant boxes and lifelines
  nodes.forEach(node => {
    elements.push(
      <g key={`participant-${node.id}`}>
        <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={4} fill="#1e40af" stroke="#3b82f6" strokeWidth={2} />
        <text x={node.x + node.width / 2} y={node.y + node.height / 2} textAnchor="middle" dominantBaseline="central" fill="#e2e8f0" fontSize={12} fontFamily="system-ui, sans-serif">
          {node.label.length > 14 ? node.label.slice(0, 12) + '..' : node.label}
        </text>
        {/* Lifeline */}
        <line x1={node.x + node.width / 2} y1={node.y + node.height} x2={node.x + node.width / 2} y2={totalHeight - 20} stroke="#334155" strokeWidth={1} strokeDasharray="4,4" />
        {/* Bottom box */}
        <rect x={node.x} y={totalHeight - 40} width={node.width} height={node.height} rx={4} fill="#1e40af" stroke="#3b82f6" strokeWidth={2} />
        <text x={node.x + node.width / 2} y={totalHeight - 40 + node.height / 2} textAnchor="middle" dominantBaseline="central" fill="#e2e8f0" fontSize={12} fontFamily="system-ui, sans-serif">
          {node.label.length > 14 ? node.label.slice(0, 12) + '..' : node.label}
        </text>
      </g>
    );
  });

  // Draw messages
  sequences.forEach((msg, i) => {
    const fromNode = nodes.find(n => n.id === msg.from || n.label === msg.from);
    const toNode = nodes.find(n => n.id === msg.to || n.label === msg.to);
    if (!fromNode || !toNode) return;

    const y = 100 + i * 50;
    const x1 = fromNode.x + fromNode.width / 2;
    const x2 = toNode.x + toNode.width / 2;
    const strokeDash = msg.type === 'dashed' ? '6,4' : undefined;

    elements.push(
      <g key={`msg-${i}`}>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke="#60a5fa" strokeWidth={1.5} strokeDasharray={strokeDash} markerEnd="url(#arrowhead)" />
        <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" fill="#94a3b8" fontSize={10} fontFamily="system-ui, sans-serif">
          {msg.label.length > 30 ? msg.label.slice(0, 28) + '..' : msg.label}
        </text>
      </g>
    );
  });

  return <>{elements}</>;
}

function renderGanttSVG(diagram: ParsedDiagram): React.ReactNode {
  const { ganttTasks = [], title } = diagram;
  if (ganttTasks.length === 0) return null;

  const barHeight = 28;
  const rowGap = 6;
  const leftMargin = 160;
  const colWidth = 60;
  const topMargin = title ? 50 : 20;

  const elements: React.ReactNode[] = [];

  if (title) {
    elements.push(
      <text key="title" x={leftMargin + 100} y={25} textAnchor="middle" fill="#e2e8f0" fontSize={14} fontWeight="bold" fontFamily="system-ui, sans-serif">{title}</text>
    );
  }

  let currentSection = '';
  let sectionY = topMargin;

  ganttTasks.forEach((task, i) => {
    if (task.section && task.section !== currentSection) {
      currentSection = task.section;
      elements.push(
        <text key={`section-${i}`} x={5} y={sectionY + barHeight / 2 + 4} fill="#60a5fa" fontSize={11} fontWeight="bold" fontFamily="system-ui, sans-serif">{currentSection}</text>
      );
      sectionY += barHeight + rowGap;
    }

    const y = sectionY;
    const x = leftMargin + task.startCol * colWidth;
    const w = task.duration * colWidth;

    const fills: Record<string, string> = { done: '#22c55e', active: '#3b82f6', crit: '#ef4444', default: '#6366f1' };
    const fill = fills[task.status] || fills.default;

    elements.push(
      <g key={`task-${i}`}>
        <text x={leftMargin - 10} y={y + barHeight / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize={10} fontFamily="system-ui, sans-serif">
          {task.name.length > 20 ? task.name.slice(0, 18) + '..' : task.name}
        </text>
        <rect x={x} y={y} width={w} height={barHeight} rx={4} fill={fill} opacity={0.8} />
        <text x={x + w / 2} y={y + barHeight / 2 + 4} textAnchor="middle" fill="white" fontSize={10} fontFamily="system-ui, sans-serif">{task.name.length > 10 ? task.name.slice(0, 8) + '..' : task.name}</text>
      </g>
    );

    sectionY += barHeight + rowGap;
  });

  return <>{elements}</>;
}

function computeSVGSize(diagram: ParsedDiagram): { width: number; height: number } {
  if (diagram.type === 'gantt') {
    const tasks = diagram.ganttTasks || [];
    return { width: 160 + (tasks.length + 3) * 60 + 40, height: 50 + (tasks.length + 2) * 34 + 40 };
  }
  if (diagram.type === 'sequence') {
    return {
      width: Math.max(400, diagram.nodes.length * 180 + 80),
      height: 100 + (diagram.sequences?.length || 0) * 50 + 80,
    };
  }
  let maxX = 300, maxY = 200;
  diagram.nodes.forEach(n => {
    maxX = Math.max(maxX, n.x + n.width + 60);
    maxY = Math.max(maxY, n.y + n.height + 60);
  });
  return { width: maxX, height: maxY };
}

export default function DiagramFromText() {
  const [code, setCode] = useState(SAMPLE_MERMAID);
  const [syntaxMode, setSyntaxMode] = useState<SyntaxMode>('mermaid');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { pushHistory, shapes } = useGraphicsStore();

  // Parse code into diagram
  const diagram = useMemo<ParsedDiagram>(() => {
    try {
      setError(null);
      if (!code.trim()) return { type: 'unknown', nodes: [], edges: [], direction: 'TB' };
      if (syntaxMode === 'csv') {
        const mermaidCode = csvToMermaid(code);
        return parseMermaid(mermaidCode);
      }
      if (syntaxMode === 'plantuml') return parsePlantUML(code);
      return parseMermaid(code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse error');
      return { type: 'unknown', nodes: [], edges: [], direction: 'TB' };
    }
  }, [code, syntaxMode]);

  const svgSize = useMemo(() => computeSVGSize(diagram), [diagram]);

  // AI prompt -> generate code
  const handleAiGenerate = useCallback((prompt: string) => {
    const generated = generateMermaidFromPrompt(prompt);
    setSyntaxMode('mermaid');
    setCode(generated);
    setAiPrompt('');
    setShowAiPanel(false);
  }, []);

  // Switch syntax mode with sample
  const handleModeSwitch = useCallback((mode: SyntaxMode) => {
    setSyntaxMode(mode);
    if (mode === 'mermaid') setCode(SAMPLE_MERMAID);
    else if (mode === 'plantuml') setCode(SAMPLE_PLANTUML);
    else if (mode === 'csv') setCode(SAMPLE_CSV);
  }, []);

  // Export code to file
  const handleExport = useCallback(() => {
    const ext = syntaxMode === 'csv' ? 'csv' : syntaxMode === 'plantuml' ? 'puml' : 'mmd';
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `diagram.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [code, syntaxMode]);

  // Export SVG
  const handleExportSVG = useCallback(() => {
    const svgEl = document.querySelector('.diagram-preview-svg') as SVGSVGElement;
    if (!svgEl) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  // Import file
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (file.name.endsWith('.csv')) { setSyntaxMode('csv'); }
      else if (file.name.endsWith('.puml') || file.name.endsWith('.plantuml')) { setSyntaxMode('plantuml'); }
      else { setSyntaxMode('mermaid'); }
      setCode(text);
    };
    reader.readAsText(file);
    setShowImport(false);
  }, []);

  // Copy code to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => { /* ignore */ });
  }, [code]);

  // Push diagram nodes to graphics canvas as shapes
  const handlePushToCanvas = useCallback(() => {
    const newShapes: Shape[] = diagram.nodes.map(node => {
      let type: Shape['type'] = 'rect';
      if (node.shape === 'diamond') type = 'diamond';
      else if (node.shape === 'circle' || node.shape === 'stadium') type = 'ellipse';
      else if (node.shape === 'hexagon') type = 'hexagon';
      else if (node.shape === 'cylinder') type = 'cylinder';

      const s = createShape(type, node.x, node.y);
      return { ...s, id: genId(), width: node.width, height: node.height, label: node.label } as Shape;
    });
    pushHistory([...shapes, ...newShapes]);
  }, [diagram, shapes, pushHistory]);

  const btnCls = 'px-2.5 py-1.5 rounded text-xs transition-colors';
  const activeBtnCls = 'bg-blue-600 text-white';
  const inactiveBtnCls = 'text-[#94a3b8] hover:bg-[#334155] hover:text-white';

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-[#e2e8f0]">
      {/* Top toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#334155] bg-[#1e293b] flex-wrap min-h-[40px]">
        {/* Syntax mode tabs */}
        <div className="flex items-center bg-[#0f172a] rounded p-0.5 mr-2">
          {([['mermaid', Code, 'Mermaid'], ['plantuml', FileText, 'PlantUML'], ['csv', Table, 'CSV']] as const).map(([mode, Icon, label]) => (
            <button key={mode} onClick={() => handleModeSwitch(mode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${syntaxMode === mode ? activeBtnCls : inactiveBtnCls}`}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-[#334155]" />

        {/* AI Generate */}
        <button onClick={() => setShowAiPanel(!showAiPanel)}
          className={`flex items-center gap-1.5 ${btnCls} ${showAiPanel ? 'bg-purple-600 text-white' : 'text-purple-400 hover:bg-purple-600/20'}`}>
          <Sparkles size={13} />AI Generate
        </button>

        <div className="w-px h-5 bg-[#334155]" />

        {/* Import / Export */}
        <button onClick={() => { setShowImport(true); fileInputRef.current?.click(); }}
          className={`flex items-center gap-1.5 ${btnCls} ${inactiveBtnCls}`}>
          <Upload size={13} />Import
        </button>
        <input ref={fileInputRef} type="file" accept=".mmd,.mermaid,.puml,.plantuml,.csv,.txt" onChange={handleImport} className="hidden" />

        <button onClick={handleExport}
          className={`flex items-center gap-1.5 ${btnCls} ${inactiveBtnCls}`}>
          <Download size={13} />Export Code
        </button>

        <button onClick={handleExportSVG}
          className={`flex items-center gap-1.5 ${btnCls} text-green-400 hover:bg-green-600/20`}>
          <Download size={13} />Export SVG
        </button>

        <div className="w-px h-5 bg-[#334155]" />

        <button onClick={handleCopy} className={`flex items-center gap-1.5 ${btnCls} ${inactiveBtnCls}`}>
          <Copy size={13} />Copy
        </button>

        <div className="flex-1" />

        <button onClick={handlePushToCanvas}
          className={`flex items-center gap-1.5 ${btnCls} bg-blue-600/20 text-blue-400 hover:bg-blue-600/30`}>
          <ArrowRightToLine size={13} />Send to Canvas
        </button>

        {/* Node/Edge count */}
        <span className="text-[10px] text-[#64748b] ml-2">
          {diagram.nodes.length} nodes {diagram.edges.length > 0 && `/ ${diagram.edges.length} edges`}
          {diagram.sequences && diagram.sequences.length > 0 && `/ ${diagram.sequences.length} messages`}
        </span>
      </div>

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* AI Panel (optional left) */}
        {showAiPanel && (
          <div className="w-60 border-r border-[#334155] bg-[#1e293b] flex flex-col flex-shrink-0">
            <div className="flex items-center justify-between p-3 border-b border-[#334155]">
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5"><Sparkles size={13} />AI Prompt to Diagram</span>
              <button onClick={() => setShowAiPanel(false)} className="text-[#64748b] hover:text-white"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <p className="text-[10px] text-[#64748b] uppercase font-semibold mb-1">Quick Prompts</p>
              {AI_PROMPTS.map(p => (
                <button key={p} onClick={() => handleAiGenerate(p)}
                  className="w-full text-left px-2.5 py-2 rounded text-[11px] bg-[#0f172a] hover:bg-[#334155] transition-colors">
                  {p}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-[#334155]">
              <p className="text-[10px] text-[#64748b] mb-1.5">Custom prompt</p>
              <div className="flex gap-2">
                <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && aiPrompt.trim() && handleAiGenerate(aiPrompt)}
                  placeholder="Describe your diagram..."
                  className="flex-1 px-2.5 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs focus:outline-none focus:border-purple-500" />
                <button onClick={() => aiPrompt.trim() && handleAiGenerate(aiPrompt)}
                  disabled={!aiPrompt.trim()}
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-xs text-white">
                  <Play size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Code Editor */}
        <div className="flex flex-col w-[40%] min-w-[280px] border-r border-[#334155]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e293b] border-b border-[#334155]">
            <span className="text-[10px] font-semibold uppercase text-[#64748b]">
              {syntaxMode === 'csv' ? 'CSV Data' : syntaxMode === 'plantuml' ? 'PlantUML Code' : 'Mermaid Code'}
            </span>
            <span className="text-[10px] text-[#475569]">{code.split('\n').length} lines</span>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full resize-none p-3 bg-[#0f172a] text-[#e2e8f0] font-mono text-[13px] leading-6 focus:outline-none border-none"
              style={{ tabSize: 4 }}
            />
            {/* Line numbers overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0f172a] border-r border-[#1e293b] pointer-events-none overflow-hidden" style={{ paddingTop: '12px' }}>
              {code.split('\n').map((_, i) => (
                <div key={i} className="text-[10px] text-[#334155] text-right pr-2 leading-6">{i + 1}</div>
              ))}
            </div>
            <style>{`.diagram-from-text textarea { padding-left: 48px !important; }`}</style>
          </div>
          {error && (
            <div className="px-3 py-1.5 bg-red-900/30 border-t border-red-800 text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col flex-1 min-w-[300px]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e293b] border-b border-[#334155]">
            <span className="text-[10px] font-semibold uppercase text-[#64748b]">Live Preview</span>
            <span className="text-[10px] text-[#475569]">
              {diagram.type !== 'unknown' ? diagram.type.charAt(0).toUpperCase() + diagram.type.slice(1) : 'No diagram'} diagram
            </span>
          </div>
          <div className="flex-1 overflow-auto bg-[#0a0f1e] p-4">
            {diagram.nodes.length === 0 && (!diagram.ganttTasks || diagram.ganttTasks.length === 0) && (!diagram.sequences || diagram.sequences.length === 0) ? (
              <div className="flex items-center justify-center h-full text-[#334155] text-sm">
                <div className="text-center space-y-2">
                  <Code size={32} className="mx-auto opacity-40" />
                  <p>Enter code on the left to see a live preview</p>
                  <p className="text-[10px] text-[#1e293b]">Supports Mermaid, PlantUML, and CSV</p>
                </div>
              </div>
            ) : (
              <svg className="diagram-preview-svg" width={svgSize.width} height={svgSize.height}
                viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                  </marker>
                </defs>

                {/* Background */}
                <rect width={svgSize.width} height={svgSize.height} fill="#0a0f1e" rx={8} />

                {diagram.type === 'gantt' ? renderGanttSVG(diagram) : diagram.type === 'sequence' ? renderSequenceSVG(diagram) : (
                  <>
                    {diagram.edges.map((edge, i) => <React.Fragment key={`edge-${i}`}>{renderEdgeSVG(edge, diagram.nodes)}</React.Fragment>)}
                    {diagram.nodes.map(node => renderNodeSVG(node))}
                  </>
                )}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
