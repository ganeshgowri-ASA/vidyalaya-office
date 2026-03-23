'use client';
import React, { useState } from 'react';
import { useGraphicsStore, createShape, genId, Shape, ShapeBase } from '@/store/graphics-store';

export interface DiagramTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  shapes: Partial<ShapeBase & { type: string }>[];
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'flowchart', label: 'Flowchart', icon: '🔀' },
  { id: 'orgchart', label: 'Org Chart', icon: '🏢' },
  { id: 'mindmap', label: 'Mind Map', icon: '🧠' },
  { id: 'network', label: 'Network', icon: '🌐' },
  { id: 'uml', label: 'UML', icon: '📐' },
  { id: 'wireframe', label: 'Wireframe', icon: '📱' },
  { id: 'erd', label: 'ER Diagram', icon: '🗄' },
  { id: 'bpmn', label: 'BPMN', icon: '⚙' },
];

const TEMPLATES: DiagramTemplate[] = [
  {
    id: 'basic-flowchart',
    name: 'Basic Flowchart',
    category: 'flowchart',
    description: 'Start to end process with decision',
    icon: '🔀',
    shapes: [
      { type: 'ellipse', x: 340, y: 40, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Start' },
      { type: 'rect', x: 330, y: 150, width: 140, height: 70, fill: '#3b82f6', stroke: '#1e40af', label: 'Process A' },
      { type: 'diamond', x: 330, y: 280, width: 140, height: 100, fill: '#f59e0b', stroke: '#b45309', label: 'Decision?' },
      { type: 'rect', x: 140, y: 430, width: 140, height: 70, fill: '#3b82f6', stroke: '#1e40af', label: 'Process B' },
      { type: 'rect', x: 520, y: 430, width: 140, height: 70, fill: '#3b82f6', stroke: '#1e40af', label: 'Process C' },
      { type: 'ellipse', x: 340, y: 560, width: 120, height: 60, fill: '#ef4444', stroke: '#b91c1c', label: 'End' },
      { type: 'arrow', x: 395, y: 100, width: 10, height: 50, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'arrow', x: 395, y: 220, width: 10, height: 60, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'text', x: 470, y: 300, width: 40, height: 24, fill: 'transparent', stroke: 'transparent', label: 'Yes' },
      { type: 'text', x: 290, y: 300, width: 30, height: 24, fill: 'transparent', stroke: 'transparent', label: 'No' },
    ],
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    category: 'flowchart',
    description: 'Multi-branch decision flow',
    icon: '🌳',
    shapes: [
      { type: 'diamond', x: 320, y: 40, width: 160, height: 100, fill: '#8b5cf6', stroke: '#6d28d9', label: 'Main Question?' },
      { type: 'diamond', x: 100, y: 200, width: 140, height: 90, fill: '#f59e0b', stroke: '#b45309', label: 'Option A?' },
      { type: 'diamond', x: 500, y: 200, width: 140, height: 90, fill: '#f59e0b', stroke: '#b45309', label: 'Option B?' },
      { type: 'rect', x: 30, y: 350, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Result 1' },
      { type: 'rect', x: 190, y: 350, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Result 2' },
      { type: 'rect', x: 430, y: 350, width: 120, height: 60, fill: '#ef4444', stroke: '#b91c1c', label: 'Result 3' },
      { type: 'rect', x: 590, y: 350, width: 120, height: 60, fill: '#ef4444', stroke: '#b91c1c', label: 'Result 4' },
      { type: 'text', x: 230, y: 140, width: 30, height: 24, fill: 'transparent', stroke: 'transparent', label: 'Yes' },
      { type: 'text', x: 490, y: 140, width: 30, height: 24, fill: 'transparent', stroke: 'transparent', label: 'No' },
    ],
  },
  {
    id: 'company-orgchart',
    name: 'Company Hierarchy',
    category: 'orgchart',
    description: 'CEO to department structure',
    icon: '🏢',
    shapes: [
      { type: 'rect', x: 320, y: 40, width: 160, height: 70, fill: '#8b5cf6', stroke: '#6d28d9', label: 'CEO' },
      { type: 'rect', x: 100, y: 170, width: 150, height: 60, fill: '#3b82f6', stroke: '#1e40af', label: 'VP Engineering' },
      { type: 'rect', x: 320, y: 170, width: 150, height: 60, fill: '#3b82f6', stroke: '#1e40af', label: 'VP Product' },
      { type: 'rect', x: 540, y: 170, width: 150, height: 60, fill: '#3b82f6', stroke: '#1e40af', label: 'VP Sales' },
      { type: 'rect', x: 40, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'Frontend' },
      { type: 'rect', x: 200, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'Backend' },
      { type: 'rect', x: 350, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'Design' },
      { type: 'rect', x: 510, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'Enterprise' },
      { type: 'rect', x: 670, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'SMB' },
    ],
  },
  {
    id: 'brainstorm-mindmap',
    name: 'Brainstorming',
    category: 'mindmap',
    description: 'Central idea with branches',
    icon: '🧠',
    shapes: [
      { type: 'ellipse', x: 320, y: 220, width: 160, height: 100, fill: '#8b5cf6', stroke: '#6d28d9', label: 'Main Idea' },
      { type: 'ellipse', x: 100, y: 60, width: 130, height: 70, fill: '#3b82f6', stroke: '#1e40af', label: 'Topic A' },
      { type: 'ellipse', x: 530, y: 60, width: 130, height: 70, fill: '#22c55e', stroke: '#15803d', label: 'Topic B' },
      { type: 'ellipse', x: 60, y: 380, width: 130, height: 70, fill: '#f59e0b', stroke: '#b45309', label: 'Topic C' },
      { type: 'ellipse', x: 570, y: 380, width: 130, height: 70, fill: '#ef4444', stroke: '#b91c1c', label: 'Topic D' },
      { type: 'rect', x: 10, y: 0, width: 90, height: 40, fill: '#60a5fa', stroke: '#2563eb', label: 'Sub A1' },
      { type: 'rect', x: 180, y: 0, width: 90, height: 40, fill: '#60a5fa', stroke: '#2563eb', label: 'Sub A2' },
      { type: 'rect', x: 510, y: 0, width: 90, height: 40, fill: '#4ade80', stroke: '#16a34a', label: 'Sub B1' },
      { type: 'rect', x: 660, y: 0, width: 90, height: 40, fill: '#4ade80', stroke: '#16a34a', label: 'Sub B2' },
    ],
  },
  {
    id: 'it-infrastructure',
    name: 'IT Infrastructure',
    category: 'network',
    description: 'Servers, firewall, and clients',
    icon: '🌐',
    shapes: [
      { type: 'cloud', x: 300, y: 20, width: 180, height: 100, fill: '#3b82f6', stroke: '#1e40af', label: 'Internet' },
      { type: 'rect', x: 330, y: 170, width: 120, height: 60, fill: '#ef4444', stroke: '#b91c1c', label: 'Firewall' },
      { type: 'rect', x: 330, y: 290, width: 120, height: 60, fill: '#8b5cf6', stroke: '#6d28d9', label: 'Load Balancer' },
      { type: 'rect', x: 120, y: 410, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Web Server 1' },
      { type: 'rect', x: 330, y: 410, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Web Server 2' },
      { type: 'rect', x: 540, y: 410, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Web Server 3' },
      { type: 'cylinder', x: 220, y: 540, width: 120, height: 70, fill: '#f59e0b', stroke: '#b45309', label: 'Primary DB' },
      { type: 'cylinder', x: 440, y: 540, width: 120, height: 70, fill: '#f59e0b', stroke: '#b45309', label: 'Replica DB' },
    ],
  },
];

function TemplateThumbnail({ template }: { template: DiagramTemplate }) {
  const minX = Math.min(...template.shapes.map(s => s.x ?? 0));
  const minY = Math.min(...template.shapes.map(s => s.y ?? 0));
  const maxX = Math.max(...template.shapes.map(s => (s.x ?? 0) + (s.width ?? 100)));
  const maxY = Math.max(...template.shapes.map(s => (s.y ?? 0) + (s.height ?? 60)));
  const pad = 10;
  const vb = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

  return (
    <svg viewBox={vb} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {template.shapes.map((s, i) => {
        const x = s.x ?? 0, y = s.y ?? 0, w = s.width ?? 100, h = s.height ?? 60;
        const common = { fill: s.fill ?? '#3b82f6', stroke: s.stroke ?? '#1e40af', strokeWidth: 1.5, opacity: 0.9 };
        let el: React.ReactNode = null;
        switch (s.type) {
          case 'rect': el = <rect x={x} y={y} width={w} height={h} rx={4} {...common} />; break;
          case 'ellipse': el = <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />; break;
          case 'diamond': el = <polygon points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`} {...common} />; break;
          case 'cloud': el = <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />; break;
          case 'cylinder': el = <><rect x={x} y={y + 10} width={w} height={h - 10} rx={2} {...common} /><ellipse cx={x + w / 2} cy={y + 10} rx={w / 2} ry={10} {...common} /></>; break;
          case 'arrow': el = <line x1={x} y1={y} x2={x} y2={y + h} stroke={s.stroke ?? '#94a3b8'} strokeWidth={1.5} markerEnd="url(#arrowhead)" />; break;
          case 'text': break;
          default: el = <rect x={x} y={y} width={w} height={h} rx={4} {...common} />;
        }
        return <g key={i}>{el}{s.label && s.type !== 'arrow' && s.type !== 'text' && (
          <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={Math.min(10, w / (s.label.length * 0.7))} fontFamily="system-ui">{s.label}</text>
        )}</g>;
      })}
      <defs><marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><polygon points="0 0, 6 2, 0 4" fill="#94a3b8" /></marker></defs>
    </svg>
  );
}

export default function DiagramTemplateGallery() {
  const { shapes, pushHistory, setSelectedId, setSelectedIds, setPan, setZoom } = useGraphicsStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const loadTemplate = (template: DiagramTemplate) => {
    const newShapes: Shape[] = template.shapes.map(s => {
      const base = createShape((s.type as any) ?? 'rect', s.x ?? 0, s.y ?? 0);
      return {
        ...base,
        id: genId(),
        width: s.width ?? base.width,
        height: s.height ?? base.height,
        fill: s.fill ?? base.fill,
        stroke: s.stroke ?? base.stroke,
        label: s.label ?? '',
      } as Shape;
    });
    pushHistory([...shapes, ...newShapes]);
    setPan({ x: 0, y: 0 });
    setZoom(0.8);
    setSelectedId(null);
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full px-2 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs text-[#e2e8f0] placeholder:text-[#64748b]"
        />
      </div>

      {/* Category filters */}
      <div className="px-2 pb-2 flex flex-wrap gap-1">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Template cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        {filtered.length === 0 && (
          <p className="text-[10px] text-[#64748b] text-center py-4">No templates found</p>
        )}
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => loadTemplate(t)}
            className="w-full rounded-lg border border-[#334155] bg-[#0f172a] hover:border-blue-500 hover:bg-[#1a2540] transition-colors text-left group"
          >
            <div className="h-24 p-2 border-b border-[#334155] bg-[#0a0f1a] rounded-t-lg">
              <TemplateThumbnail template={t} />
            </div>
            <div className="p-2">
              <p className="text-[11px] font-medium text-[#e2e8f0] group-hover:text-blue-400 transition-colors">
                {t.icon} {t.name}
              </p>
              <p className="text-[9px] text-[#64748b] mt-0.5">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { TEMPLATES, TEMPLATE_CATEGORIES };
