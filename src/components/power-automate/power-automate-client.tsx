'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Plus, Search, Play, Pause, MoreVertical, Clock, CheckCircle2,
  XCircle, AlertCircle, ArrowRight, GitBranch, Repeat, Timer, Trash2,
  ChevronRight, LayoutGrid, History, Plug, FileText, Mail, Globe,
  HardDrive, Table, MessageSquare, Database, Code, Cloud, RefreshCw,
  ClipboardCheck, UserPlus, X, ChevronDown, Settings, Eye, Monitor, Filter, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePowerAutomateStore, Flow, FlowNode } from '@/store/power-automate-store';

const nodeIcons: Record<string, React.ElementType> = {
  trigger: Zap,
  condition: GitBranch,
  action: Play,
  loop: Repeat,
  delay: Timer,
  end: CheckCircle2,
};

const connectorIcons: Record<string, React.ElementType> = {
  globe: Globe, mail: Mail, hardDrive: HardDrive, table: Table,
  messageSquare: MessageSquare, code: Code, database: Database, cloud: Cloud,
};

function FlowDesigner() {
  const { designerFlow, selectedNodeId, setSelectedNodeId, setDesignerFlow, updateNodePosition, removeNodeFromDesigner, addNodeToDesigner } = usePowerAutomateStore();
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!designerFlow) return null;

  const handleMouseDown = (e: React.MouseEvent, nodeId: string, node: FlowNode) => {
    e.stopPropagation();
    setDragging(nodeId);
    setSelectedNodeId(nodeId);
    const rect = (e.target as HTMLElement).closest('[data-node]')?.getBoundingClientRect();
    if (rect) {
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const canvas = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvas.left - dragOffset.x;
    const y = e.clientY - canvas.top - dragOffset.y;
    updateNodePosition(dragging, Math.max(0, x), Math.max(0, y));
  };

  const handleMouseUp = () => setDragging(null);

  const addNewNode = (type: FlowNode['type'], label: string) => {
    const maxY = designerFlow.nodes.reduce((max, n) => Math.max(max, n.y), 0);
    addNodeToDesigner({
      id: `node-${Date.now()}`,
      type,
      label,
      description: `New ${type}`,
      icon: type,
      x: 400,
      y: maxY + 120,
      config: {},
    });
    setShowAddMenu(false);
  };

  const selectedNode = designerFlow.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Canvas */}
      <div
        className="flex-1 relative overflow-auto"
        style={{ backgroundColor: 'var(--background)' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedNodeId(null)}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setDesignerFlow(null)} className="p-1 rounded hover:opacity-80" style={{ color: 'var(--foreground)' }}>
              <X size={18} />
            </button>
            <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>{designerFlow.name}</h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}>
              {designerFlow.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Test handled in flow detail overlay
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm"
              style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}
            >
              <Play size={14} /> Test Flow
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <Settings size={14} /> Settings
            </button>
          </div>
        </div>

        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full" style={{ minHeight: 800 }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connections */}
          {designerFlow.connections.map((conn) => {
            const from = designerFlow.nodes.find((n) => n.id === conn.fromNodeId);
            const to = designerFlow.nodes.find((n) => n.id === conn.toNodeId);
            if (!from || !to) return null;
            const fx = from.x + 100;
            const fy = from.y + 40;
            const tx = to.x + 100;
            const ty = to.y;
            const midY = (fy + ty) / 2;
            return (
              <g key={conn.id}>
                <path
                  d={`M${fx},${fy} C${fx},${midY} ${tx},${midY} ${tx},${ty}`}
                  fill="none"
                  stroke="var(--sidebar-accent)"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <polygon
                  points={`${tx - 5},${ty - 8} ${tx + 5},${ty - 8} ${tx},${ty}`}
                  fill="var(--sidebar-accent)"
                  opacity="0.6"
                />
                {conn.label && (
                  <text x={(fx + tx) / 2 + 10} y={midY} fill="var(--foreground)" fontSize="11" opacity="0.7">
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="relative" style={{ minHeight: 800 }}>
          {designerFlow.nodes.map((node) => {
            const Icon = nodeIcons[node.type] ?? Zap;
            const isSelected = selectedNodeId === node.id;
            const colors: Record<string, string> = {
              trigger: '#7c3aed',
              condition: '#f59e0b',
              action: '#3b82f6',
              loop: '#10b981',
              delay: '#6b7280',
              end: '#ef4444',
            };
            return (
              <div
                key={node.id}
                data-node
                className={cn('absolute cursor-move rounded-lg border-2 w-[200px]')}
                style={{
                  left: node.x,
                  top: node.y,
                  backgroundColor: 'var(--card)',
                  borderColor: isSelected ? colors[node.type] : 'var(--border)',
                  boxShadow: isSelected ? `0 0 0 2px var(--background), 0 0 0 4px ${colors[node.type]}` : 'none',
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id, node)}
                onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
              >
                <div className="flex items-center gap-2 px-3 py-2 rounded-t-md" style={{ backgroundColor: colors[node.type] + '20' }}>
                  <div className="p-1 rounded" style={{ backgroundColor: colors[node.type] }}>
                    <Icon size={14} color="white" />
                  </div>
                  <span className="text-xs font-semibold uppercase" style={{ color: colors[node.type] }}>{node.type}</span>
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{node.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{node.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add node button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <Plus size={16} /> Add Step
            </button>
            {showAddMenu && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 rounded-lg border shadow-xl py-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                {[
                  { type: 'action' as const, label: 'Action' },
                  { type: 'condition' as const, label: 'Condition' },
                  { type: 'loop' as const, label: 'Loop' },
                  { type: 'delay' as const, label: 'Delay' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addNewNode(item.type, `New ${item.label}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:opacity-80"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {(() => { const I = nodeIcons[item.type]; return <I size={14} />; })()}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties panel */}
      {selectedNode && (
        <div className="w-72 border-l overflow-y-auto" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Node Properties</h3>
              <button onClick={() => removeNodeFromDesigner(selectedNode.id)} className="p-1 rounded hover:opacity-80" style={{ color: '#ef4444' }}>
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Label</label>
                <input className="w-full mt-1 px-2 py-1.5 rounded border text-sm" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} value={selectedNode.label} readOnly />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Type</label>
                <p className="text-sm mt-1 capitalize" style={{ color: 'var(--foreground)' }}>{selectedNode.type}</p>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Description</label>
                <textarea className="w-full mt-1 px-2 py-1.5 rounded border text-sm resize-none" rows={2} style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} value={selectedNode.description} readOnly />
              </div>
              {Object.entries(selectedNode.config).length > 0 && (
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Configuration</label>
                  <div className="mt-1 space-y-1">
                    {Object.entries(selectedNode.config).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--background)' }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>{key}</span>
                        <span style={{ color: 'var(--foreground)' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function FlowDetailOverlay({ flow, onClose }: { flow: Flow; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'steps' | 'settings'>('steps');
  const [testRunning, setTestRunning] = useState(false);
  const [testStep, setTestStep] = useState(-1);
  const [testComplete, setTestComplete] = useState(false);

  const simulationSteps = [
    { label: 'Trigger', icon: '⚡' },
    { label: 'Condition', icon: '🔀' },
    { label: 'Action', icon: '▶️' },
    { label: 'Complete', icon: '✅' },
  ];

  const runTest = useCallback(() => {
    setTestRunning(true);
    setTestStep(-1);
    setTestComplete(false);
    let step = 0;
    const interval = setInterval(() => {
      setTestStep(step);
      step++;
      if (step >= simulationSteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setTestComplete(true);
          setTestRunning(false);
        }, 600);
      }
    }, 800);
  }, [simulationSteps.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="w-[700px] max-h-[85vh] rounded-xl border shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--sidebar-accent)' + '20' }}>
              <Zap size={18} style={{ color: 'var(--sidebar-accent)' }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>{flow.name}</h2>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{flow.trigger}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--muted-foreground)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {[
            { key: 'steps' as const, label: 'Flow Steps' },
            { key: 'settings' as const, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 -mb-px"
              style={{
                borderColor: activeTab === tab.key ? 'var(--sidebar-accent)' : 'transparent',
                color: activeTab === tab.key ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'steps' && (
            <div>
              {/* Flow designer steps visualization */}
              <div className="space-y-0">
                {flow.nodes.map((node, idx) => {
                  const colors: Record<string, string> = {
                    trigger: '#7c3aed', condition: '#f59e0b', action: '#3b82f6',
                    loop: '#10b981', delay: '#6b7280', end: '#ef4444',
                  };
                  const Icon = nodeIcons[node.type] ?? Zap;
                  const isCompleted = testStep >= idx;
                  const isCurrent = testStep === idx && testRunning;
                  return (
                    <div key={node.id}>
                      <div
                        className="flex items-center gap-3 p-3 rounded-lg border transition-all"
                        style={{
                          borderColor: isCurrent ? colors[node.type] : isCompleted ? '#10b981' : 'var(--border)',
                          backgroundColor: isCurrent ? colors[node.type] + '10' : isCompleted ? '#10b98108' : 'var(--background)',
                          boxShadow: isCurrent ? '0 0 0 2px ' + colors[node.type] + '40' : 'none',
                        }}
                      >
                        <div className="p-1.5 rounded" style={{ backgroundColor: isCompleted ? '#10b981' : colors[node.type] }}>
                          <Icon size={14} color="white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{node.label}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{node.description}</p>
                        </div>
                        {isCompleted && !isCurrent && (
                          <span className="text-xs font-medium" style={{ color: '#10b981' }}>✓</span>
                        )}
                        {isCurrent && (
                          <span className="text-xs font-medium animate-pulse" style={{ color: colors[node.type] }}>Running...</span>
                        )}
                      </div>
                      {idx < flow.nodes.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="w-0.5 h-6" style={{ backgroundColor: isCompleted ? '#10b981' : 'var(--border)' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Test simulation bar */}
              {testRunning && (
                <div className="mt-5 p-3 rounded-lg border" style={{ borderColor: 'var(--sidebar-accent)', backgroundColor: 'var(--sidebar-accent)' + '08' }}>
                  <div className="flex items-center gap-3">
                    {simulationSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className={testStep >= idx ? '' : 'opacity-30'}>{step.icon}</span>
                        <span className="text-xs font-medium" style={{ color: testStep >= idx ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                          {step.label}{testStep >= idx ? '✓' : ''}
                        </span>
                        {idx < simulationSteps.length - 1 && (
                          <ArrowRight size={12} className="mx-1" style={{ color: testStep >= idx ? 'var(--sidebar-accent)' : 'var(--muted-foreground)', opacity: testStep >= idx ? 1 : 0.3 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testComplete && (
                <div className="mt-5 p-3 rounded-lg border" style={{ borderColor: '#10b981', backgroundColor: '#10b98110' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <span className="text-sm font-medium" style={{ color: '#10b981' }}>Test run completed successfully!</span>
                  </div>
                </div>
              )}

              {/* Test Flow button */}
              <div className="mt-5">
                <button
                  onClick={runTest}
                  disabled={testRunning}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}
                >
                  <Play size={14} /> {testRunning ? 'Running Test...' : 'Test Flow'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Flow Name</label>
                <input className="w-full mt-1 px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} defaultValue={flow.name} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Description</label>
                <textarea className="w-full mt-1 px-3 py-2 rounded-lg border text-sm resize-none" rows={3} style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} defaultValue={flow.description} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Flow Type</label>
                <p className="text-sm mt-1 capitalize" style={{ color: 'var(--foreground)' }}>{flow.flowType} Flow</p>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                <p className="text-sm mt-1 capitalize" style={{ color: 'var(--foreground)' }}>{flow.status}</p>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Created</label>
                <p className="text-sm mt-1" style={{ color: 'var(--foreground)' }}>{new Date(flow.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Last Updated</label>
                <p className="text-sm mt-1" style={{ color: 'var(--foreground)' }}>{new Date(flow.updatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Concurrency Control</label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <option>Allow multiple runs</option>
                  <option>Sequential only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Timeout (minutes)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} defaultValue={30} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FlowCard({ flow }: { flow: Flow }) {
  const { setDetailFlow, toggleFlowStatus } = usePowerAutomateStore();
  const statusColors: Record<string, string> = {
    active: '#10b981',
    inactive: '#6b7280',
    draft: '#f59e0b',
  };

  return (
    <div
      className="rounded-lg border p-4 cursor-pointer hover:border-opacity-80 transition-colors"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      onClick={() => usePowerAutomateStore.getState().setFlowDetailId(flow.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--sidebar-accent)' + '20' }}>
            <Zap size={18} style={{ color: 'var(--sidebar-accent)' }} />
          </div>
          <div>
            <h3 className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{flow.name}</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{flow.trigger}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: statusColors[flow.status] + '20', color: statusColors[flow.status] }}>
            {flow.status}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFlowStatus(flow.id); }}
            className="p-1 rounded hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {flow.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>{flow.description}</p>
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Play size={12} /> {flow.runCount} runs</span>
          {flow.lastRun && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {new Date(flow.lastRun).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setDesignerFlow(flow); }}
            className="text-xs px-2 py-0.5 rounded border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            Edit
          </button>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}

export function PowerAutomateClient() {
  const {
    flows, templates, flowRuns, connectors,
    activeView, setActiveView, searchQuery, setSearchQuery,
    designerFlow, flowTypeFilter, setFlowTypeFilter,
    flowDetailId, setFlowDetailId, toggleConnector,
  } = usePowerAutomateStore();
  const [templateCategory, setTemplateCategory] = useState('All');

  const filteredFlows = flows.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = flowTypeFilter === 'all' || f.flowType === flowTypeFilter;
    return matchesSearch && matchesType;
  });

  const templateCategories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))];
  const filteredTemplates = templateCategory === 'All' ? templates : templates.filter((t) => t.category === templateCategory);

  const detailFlow = flowDetailId ? flows.find((f) => f.id === flowDetailId) ?? null : null;

  if (activeView === 'detail' && detailFlow) {
    return <FlowDetailView />;
  }

  if (activeView === 'designer' && designerFlow) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
        <FlowDesigner />
      </div>
    );
  }

  const templateCategories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))];
  const filteredTemplates = templateCategory === 'All' ? templates : templates.filter((t) => t.category === templateCategory);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--sidebar-accent)' }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Power Automate</h1>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Visual workflow automation builder</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}
          onClick={() => setActiveView('templates')}
        >
          <Plus size={16} /> Create Flow
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { key: 'my-flows' as const, label: 'My Flows', icon: LayoutGrid },
          { key: 'templates' as const, label: 'Templates', icon: FileText },
          { key: 'runs' as const, label: 'Run History', icon: History },
          { key: 'connectors' as const, label: 'Connectors', icon: Plug },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={cn('flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors')}
            style={{
              borderColor: activeView === tab.key ? 'var(--sidebar-accent)' : 'transparent',
              color: activeView === tab.key ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeView === 'my-flows' && (
          <div>
            {/* Cloud / Desktop toggle */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {([{ key: 'cloud' as const, label: 'Cloud Flows', icon: Cloud }, { key: 'desktop' as const, label: 'Desktop Flows', icon: Monitor }]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFlowTypeFilter(tab.key)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: flowTypeFilter === tab.key ? 'var(--sidebar-accent)' : 'transparent',
                      color: flowTypeFilter === tab.key ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    }}
                  >
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  placeholder="Search flows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {/* Flow type filter tabs */}
            <div className="flex items-center gap-2 mb-5">
              {[
                { key: 'all' as const, label: 'All Flows', icon: Layers },
                { key: 'cloud' as const, label: 'Cloud Flows', icon: Cloud },
                { key: 'desktop' as const, label: 'Desktop Flows', icon: Monitor },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFlowTypeFilter(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                  style={{
                    borderColor: flowTypeFilter === tab.key ? 'var(--sidebar-accent)' : 'var(--border)',
                    backgroundColor: flowTypeFilter === tab.key ? 'var(--sidebar-accent)' + '20' : 'var(--card)',
                    color: flowTypeFilter === tab.key ? 'var(--sidebar-accent)' : 'var(--muted-foreground)',
                  }}
                >
                  <tab.icon size={13} /> {tab.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFlows.map((flow) => (
                <FlowCard key={flow.id} flow={flow} />
              ))}
            </div>
            {filteredFlows.length === 0 && (
              <div className="text-center py-12">
                <Filter size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No flows match your filters</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'templates' && (
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Flow Templates</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Start with a pre-built template and customize it for your needs.</p>
            {/* Template category filter */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {templateCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                  style={{
                    borderColor: templateCategory === cat ? 'var(--sidebar-accent)' : 'var(--border)',
                    backgroundColor: templateCategory === cat ? 'var(--sidebar-accent)' + '20' : 'var(--card)',
                    color: templateCategory === cat ? 'var(--sidebar-accent)' : 'var(--muted-foreground)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((tmpl) => {
                const icons: Record<string, React.ElementType> = {
                  clipboardCheck: ClipboardCheck, mail: Mail, refreshCw: RefreshCw,
                  clock: Clock, fileText: FileText, hardDrive: HardDrive,
                  messageSquare: MessageSquare, userPlus: UserPlus,
                };
                const Icon = icons[tmpl.icon] ?? FileText;
                return (
                  <div
                    key={tmpl.id}
                    className="rounded-lg border p-4 hover:border-opacity-60 transition-colors"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                  >
                    <div className="p-2.5 rounded-lg w-fit mb-3" style={{ backgroundColor: 'var(--sidebar-accent)' + '20' }}>
                      <Icon size={20} style={{ color: 'var(--sidebar-accent)' }} />
                    </div>
                    <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--foreground)' }}>{tmpl.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{tmpl.description}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
                      {tmpl.category}
                    </span>
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--sidebar-accent)' }}>
                        + Create from Template
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'runs' && (
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Run History</h2>
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--card)' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Flow Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Trigger</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Start Time</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {flowRuns.map((run) => {
                    const statusIcons: Record<string, React.ElementType> = {
                      succeeded: CheckCircle2, failed: XCircle, running: RefreshCw, cancelled: AlertCircle,
                    };
                    const statusColors: Record<string, string> = {
                      succeeded: '#10b981', failed: '#ef4444', running: '#3b82f6', cancelled: '#6b7280',
                    };
                    const StatusIcon = statusIcons[run.status];
                    return (
                      <tr key={run.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon size={14} style={{ color: statusColors[run.status] }} />
                            <span className="text-xs capitalize" style={{ color: statusColors[run.status] }}>{run.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{run.flowName}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{run.trigger}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(run.startTime).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{run.duration}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'connectors' && (
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Connectors</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Connect your flows to external services and data sources.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {connectors.map((conn) => {
                const Icon = connectorIcons[conn.icon] ?? Globe;
                return (
                  <div key={conn.id} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                        <Icon size={20} style={{ color: 'var(--sidebar-accent)' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{conn.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{conn.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: conn.connected ? '#10b981' : 'var(--muted-foreground)' }}>
                        {conn.connected ? 'Connected' : 'Disconnected'}
                      </span>
                      <button
                        onClick={() => toggleConnector(conn.id)}
                        className="text-xs px-3 py-1.5 rounded font-medium transition-colors"
                        style={{
                          backgroundColor: conn.connected ? '#ef444420' : '#10b98120',
                          color: conn.connected ? '#ef4444' : '#10b981',
                        }}
                      >
                        {conn.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleConnector(conn.id)}
                      className="relative flex items-center w-10 h-5 rounded-full transition-colors cursor-pointer"
                      style={{
                        backgroundColor: conn.connected ? '#10b981' : 'var(--border)',
                      }}
                      title={conn.connected ? 'Disconnect' : 'Connect'}
                    >
                      <div
                        className="absolute w-3.5 h-3.5 rounded-full transition-transform"
                        style={{
                          backgroundColor: 'white',
                          transform: conn.connected ? 'translateX(22px)' : 'translateX(3px)',
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      {/* Flow Detail Overlay */}
      {detailFlow && (
        <FlowDetailOverlay flow={detailFlow} onClose={() => setFlowDetailId(null)} />
      )}
      </div>
    </div>
  );
}