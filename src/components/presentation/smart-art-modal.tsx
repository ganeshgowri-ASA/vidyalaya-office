'use client';

import React, { useState } from 'react';
import {
  X,
  GitBranch,
  ArrowRightCircle,
  RefreshCw,
  Network,
  Circle,
} from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

type SmartArtType = 'org-chart' | 'process-flow' | 'cycle' | 'hierarchy' | 'venn';

interface SmartArtOption {
  type: SmartArtType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const SMART_ART_OPTIONS: SmartArtOption[] = [
  {
    type: 'org-chart',
    label: 'Org Chart',
    icon: <Network size={24} />,
    description: 'Organizational chart with reporting structure',
  },
  {
    type: 'process-flow',
    label: 'Process Flow',
    icon: <ArrowRightCircle size={24} />,
    description: 'Step-by-step process diagram',
  },
  {
    type: 'cycle',
    label: 'Cycle',
    icon: <RefreshCw size={24} />,
    description: 'Circular process or lifecycle',
  },
  {
    type: 'hierarchy',
    label: 'Hierarchy',
    icon: <GitBranch size={24} />,
    description: 'Hierarchical tree structure',
  },
  {
    type: 'venn',
    label: 'Venn Diagram',
    icon: <Circle size={24} />,
    description: 'Overlapping circles for comparisons',
  },
];

interface NodeData {
  id: string;
  label: string;
}

function generateSmartArtSVG(type: SmartArtType, nodes: NodeData[]): string {
  switch (type) {
    case 'org-chart': {
      const top = nodes[0]?.label || 'CEO';
      const children = nodes.slice(1, 4);
      const childLabels = [
        children[0]?.label || 'Manager A',
        children[1]?.label || 'Manager B',
        children[2]?.label || 'Manager C',
      ];
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350">
        <rect x="225" y="20" width="150" height="50" rx="8" fill="#3b82f6" stroke="#2563eb" stroke-width="2"/>
        <text x="300" y="50" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${top}</text>
        <line x1="300" y1="70" x2="300" y2="110" stroke="#94a3b8" stroke-width="2"/>
        <line x1="100" y1="110" x2="500" y2="110" stroke="#94a3b8" stroke-width="2"/>
        ${childLabels.map((label, i) => {
          const cx = 100 + i * 200;
          return `<line x1="${cx}" y1="110" x2="${cx}" y2="140" stroke="#94a3b8" stroke-width="2"/>
          <rect x="${cx - 75}" y="140" width="150" height="45" rx="8" fill="#60a5fa" stroke="#3b82f6" stroke-width="2"/>
          <text x="${cx}" y="167" text-anchor="middle" fill="white" font-size="12">${label}</text>`;
        }).join('')}
        ${childLabels.map((_, i) => {
          const cx = 100 + i * 200;
          return `<line x1="${cx}" y1="185" x2="${cx}" y2="215" stroke="#94a3b8" stroke-width="2"/>
          <rect x="${cx - 60}" y="215" width="120" height="40" rx="6" fill="#93c5fd" stroke="#60a5fa" stroke-width="1.5"/>
          <text x="${cx}" y="240" text-anchor="middle" fill="#1e3a5f" font-size="11">Team ${i + 1}</text>`;
        }).join('')}
      </svg>`;
    }
    case 'process-flow': {
      const steps = nodes.length > 0 ? nodes : [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
        { id: '3', label: 'Step 3' },
        { id: '4', label: 'Step 4' },
      ];
      const stepCount = Math.min(steps.length, 5);
      const stepW = 110;
      const gap = 30;
      const totalW = stepCount * stepW + (stepCount - 1) * gap;
      const startX = (600 - totalW) / 2;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200">
        ${steps.slice(0, stepCount).map((s, i) => {
          const x = startX + i * (stepW + gap);
          const arrow = i < stepCount - 1
            ? `<polygon points="${x + stepW + 5},100 ${x + stepW + gap - 5},85 ${x + stepW + gap - 5},115" fill="#3b82f6"/>`
            : '';
          return `<rect x="${x}" y="60" width="${stepW}" height="80" rx="10" fill="#3b82f6" stroke="#2563eb" stroke-width="2"/>
          <text x="${x + stepW / 2}" y="105" text-anchor="middle" fill="white" font-size="13" font-weight="bold">${s.label}</text>
          ${arrow}`;
        }).join('')}
      </svg>`;
    }
    case 'cycle': {
      const items = nodes.length > 0 ? nodes : [
        { id: '1', label: 'Plan' },
        { id: '2', label: 'Do' },
        { id: '3', label: 'Check' },
        { id: '4', label: 'Act' },
      ];
      const count = Math.min(items.length, 6);
      const cx = 300, cy = 175, r = 120;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350">
        <circle cx="${cx}" cy="${cy}" r="40" fill="#3b82f6" opacity="0.2"/>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#3b82f6" font-size="12" font-weight="bold">Cycle</text>
        ${items.slice(0, count).map((item, i) => {
          const angle = (2 * Math.PI * i) / count - Math.PI / 2;
          const ix = cx + r * Math.cos(angle);
          const iy = cy + r * Math.sin(angle);
          const nextAngle = (2 * Math.PI * ((i + 1) % count)) / count - Math.PI / 2;
          const midAngle = (angle + nextAngle + (nextAngle < angle ? 2 * Math.PI : 0)) / 2;
          const arrowR = r - 15;
          const ax = cx + arrowR * Math.cos(midAngle);
          const ay = cy + arrowR * Math.sin(midAngle);
          return `<circle cx="${ix}" cy="${iy}" r="35" fill="#3b82f6" stroke="#2563eb" stroke-width="2"/>
          <text x="${ix}" y="${iy + 5}" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${item.label}</text>
          <circle cx="${ax}" cy="${ay}" r="4" fill="#60a5fa"/>`;
        }).join('')}
      </svg>`;
    }
    case 'hierarchy': {
      const root = nodes[0]?.label || 'Root';
      const level1 = [nodes[1]?.label || 'Branch A', nodes[2]?.label || 'Branch B'];
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350">
        <rect x="225" y="20" width="150" height="50" rx="8" fill="#7c3aed" stroke="#6d28d9" stroke-width="2"/>
        <text x="300" y="50" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${root}</text>
        <line x1="300" y1="70" x2="300" y2="100" stroke="#94a3b8" stroke-width="2"/>
        <line x1="150" y1="100" x2="450" y2="100" stroke="#94a3b8" stroke-width="2"/>
        ${level1.map((label, i) => {
          const cx = 150 + i * 300;
          return `<line x1="${cx}" y1="100" x2="${cx}" y2="130" stroke="#94a3b8" stroke-width="2"/>
          <rect x="${cx - 75}" y="130" width="150" height="45" rx="8" fill="#8b5cf6" stroke="#7c3aed" stroke-width="2"/>
          <text x="${cx}" y="157" text-anchor="middle" fill="white" font-size="12">${label}</text>
          <line x1="${cx - 50}" y1="175" x2="${cx - 50}" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="${cx + 50}" y1="175" x2="${cx + 50}" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="${cx - 95}" y="210" width="90" height="35" rx="6" fill="#a78bfa" stroke="#8b5cf6" stroke-width="1.5"/>
          <text x="${cx - 50}" y="232" text-anchor="middle" fill="white" font-size="10">Item ${i * 2 + 1}</text>
          <rect x="${cx + 5}" y="210" width="90" height="35" rx="6" fill="#a78bfa" stroke="#8b5cf6" stroke-width="1.5"/>
          <text x="${cx + 50}" y="232" text-anchor="middle" fill="white" font-size="10">Item ${i * 2 + 2}</text>`;
        }).join('')}
      </svg>`;
    }
    case 'venn': {
      const labels = [
        nodes[0]?.label || 'Set A',
        nodes[1]?.label || 'Set B',
        nodes[2]?.label || 'Both',
      ];
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350">
        <circle cx="230" cy="175" r="120" fill="#3b82f6" opacity="0.35" stroke="#2563eb" stroke-width="2"/>
        <circle cx="370" cy="175" r="120" fill="#ef4444" opacity="0.35" stroke="#dc2626" stroke-width="2"/>
        <text x="180" y="175" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${labels[0]}</text>
        <text x="420" y="175" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${labels[1]}</text>
        <text x="300" y="175" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${labels[2]}</text>
      </svg>`;
    }
    default:
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350"></svg>';
  }
}

export default function SmartArtModal() {
  const {
    showSmartArtModal,
    setShowSmartArtModal,
    activeSlideIndex,
    addElement,
  } = usePresentationStore();

  const [selectedType, setSelectedType] = useState<SmartArtType>('org-chart');
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' },
    { id: '3', label: 'Item 3' },
  ]);

  if (!showSmartArtModal) return null;

  const handleUpdateNode = (id: string, label: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, label } : n)));
  };

  const handleAddNode = () => {
    const newId = String(Date.now());
    setNodes((prev) => [...prev, { id: newId, label: `Item ${prev.length + 1}` }]);
  };

  const handleRemoveNode = (id: string) => {
    if (nodes.length <= 2) return;
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleInsert = () => {
    const svgContent = generateSmartArtSVG(selectedType, nodes);
    const encoded = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;

    addElement(activeSlideIndex, {
      type: 'image',
      x: 80,
      y: 60,
      width: 600,
      height: 350,
      content: encoded,
      style: {},
    });

    setShowSmartArtModal(false);
    setNodes([
      { id: '1', label: 'Item 1' },
      { id: '2', label: 'Item 2' },
      { id: '3', label: 'Item 3' },
    ]);
  };

  const previewSvg = generateSmartArtSVG(selectedType, nodes);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div
        className="rounded-lg shadow-2xl border flex flex-col"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
          width: 720,
          maxWidth: '95vw',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold">Insert SmartArt</h2>
          <button
            onClick={() => setShowSmartArtModal(false)}
            className="p-1 rounded hover:opacity-80"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Type selector */}
          <div
            className="w-52 border-r p-3 space-y-1 overflow-y-auto"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="text-xs font-medium mb-2 opacity-60">Diagram Type</div>
            {SMART_ART_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedType(opt.type)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all text-left"
                style={{
                  background: selectedType === opt.type ? 'var(--primary)' : 'transparent',
                  color: selectedType === opt.type ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                }}
              >
                {opt.icon}
                <div>
                  <div className="font-medium text-xs">{opt.label}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Preview & nodes */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Preview */}
            <div
              className="rounded border mb-4 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewSvg }}
                style={{ width: '100%', height: 220 }}
              />
            </div>

            {/* Node editor */}
            <div className="text-xs font-medium mb-2 opacity-60">Edit Nodes</div>
            <div className="space-y-1.5 mb-3">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={node.label}
                    onChange={(e) => handleUpdateNode(node.id, e.target.value)}
                    className="flex-1 px-2 py-1 rounded border text-sm outline-none"
                    style={{
                      background: 'var(--muted)',
                      borderColor: 'var(--border)',
                      color: 'var(--card-foreground)',
                    }}
                  />
                  <button
                    onClick={() => handleRemoveNode(node.id)}
                    className="p-1 rounded hover:opacity-80 text-xs"
                    style={{ color: '#ef4444' }}
                    disabled={nodes.length <= 2}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddNode}
              className="text-xs px-3 py-1 rounded border hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
              }}
            >
              + Add Node
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setShowSmartArtModal(false)}
            className="px-4 py-1.5 rounded text-sm border hover:opacity-80"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--card-foreground)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-1.5 rounded text-sm font-medium hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            Insert SmartArt
          </button>
        </div>
      </div>
    </div>
  );
}
