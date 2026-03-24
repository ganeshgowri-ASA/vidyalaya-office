#!/usr/bin/env python3
"""Modify power-automate-client.tsx to add flow type filters, flow detail overlay with test simulation, template categories, and connector toggles."""

filepath = 'src/components/power-automate/power-automate-client.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add useEffect and useCallback to imports
content = content.replace(
    "import { useState } from 'react';",
    "import { useState, useEffect, useCallback } from 'react';"
)

# 2. Add Monitor icon import for desktop flows
content = content.replace(
    "  ClipboardCheck, UserPlus, X, ChevronDown, Settings, Eye,",
    "  ClipboardCheck, UserPlus, X, ChevronDown, Settings, Eye, Monitor, Filter, Layers,"
)

# 3. Replace the existing FlowDesigner's Test Flow button to wire up simulation
old_test_btn = """            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}>
              <Play size={14} /> Test Flow
            </button>"""

new_test_btn = """            <button
              onClick={() => {
                // Test handled in flow detail overlay
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm"
              style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}
            >
              <Play size={14} /> Test Flow
            </button>"""
content = content.replace(old_test_btn, new_test_btn)

# 4. Add FlowDetailOverlay component before FlowCard
flow_detail_overlay = '''
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

'''

# Insert FlowDetailOverlay before FlowCard
content = content.replace(
    "function FlowCard({ flow }: { flow: Flow }) {",
    flow_detail_overlay + "function FlowCard({ flow }: { flow: Flow }) {"
)

# 5. Now replace the entire PowerAutomateClient to add flow type filter, template categories, connector toggles
# Find the export function and replace
old_export = '''export function PowerAutomateClient() {
  const {
    flows, templates, flowRuns, connectors,
    activeView, setActiveView, searchQuery, setSearchQuery,
    designerFlow,
  } = usePowerAutomateStore();

  const filteredFlows = flows.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );'''

new_export = '''export function PowerAutomateClient() {
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

  const detailFlow = flowDetailId ? flows.find((f) => f.id === flowDetailId) ?? null : null;'''

content = content.replace(old_export, new_export)

# 6. Replace the my-flows section to add flow type filter tabs
old_my_flows = '''        {activeView === 'my-flows' && (
          <div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFlows.map((flow) => (
                <FlowCard key={flow.id} flow={flow} />
              ))}
            </div>
          </div>
        )}'''

new_my_flows = '''        {activeView === 'my-flows' && (
          <div>
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
        )}'''

content = content.replace(old_my_flows, new_my_flows)

# 7. Replace templates section to add category filter and Create From Template
old_templates = '''        {activeView === 'templates' && (
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Flow Templates</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Start with a pre-built template and customize it for your needs.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {templates.map((tmpl) => {'''

new_templates = '''        {activeView === 'templates' && (
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
              {filteredTemplates.map((tmpl) => {'''

content = content.replace(old_templates, new_templates)

# 8. Add "Create from Template" button text to template cards
old_tmpl_category = '''                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
                      {tmpl.category}
                    </span>'''

new_tmpl_category = '''                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
                      {tmpl.category}
                    </span>
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--sidebar-accent)' }}>
                        + Create from Template
                      </span>
                    </div>'''

content = content.replace(old_tmpl_category, new_tmpl_category)

# 9. Replace connectors section to add connect/disconnect toggles
old_connectors = '''                    <span
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{
                        backgroundColor: conn.connected ? '#10b98120' : 'var(--background)',
                        color: conn.connected ? '#10b981' : 'var(--muted-foreground)',
                      }}
                    >
                      {conn.connected ? 'Connected' : 'Connect'}
                    </span>'''

new_connectors = '''                    <button
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
                    </button>'''

content = content.replace(old_connectors, new_connectors)

# 10. Add FlowDetailOverlay rendering and modify FlowCard to open detail overlay
# We need to add the overlay rendering at the end of the return, right before the closing tags
# First, let's update FlowCard to open the detail overlay instead of designer
old_flowcard_click = '''      onClick={() => setDesignerFlow(flow)}'''
new_flowcard_click = '''      onClick={() => usePowerAutomateStore.getState().setFlowDetailId(flow.id)}'''
content = content.replace(old_flowcard_click, new_flowcard_click)

# Add the flow detail overlay + edit button to FlowCard
old_flowcard_chevron = '''        <ChevronRight size={14} />
      </div>
    </div>
  );
}

export function PowerAutomateClient'''

new_flowcard_chevron = '''        <div className="flex items-center gap-2">
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

export function PowerAutomateClient'''

content = content.replace(old_flowcard_chevron, new_flowcard_chevron)

# 11. Add flow detail overlay rendering before the closing of the return
# Add it right before the last closing </div> tags
old_closing = '''      </div>
    </div>
  );
}'''

# There are multiple instances of this. Let's be more specific - find the last one
# which belongs to PowerAutomateClient
# We'll add it before the very last </div> in the component
content = content.rstrip()
# Find the position of the last occurrence
last_pos = content.rfind('      </div>\n    </div>\n  );\n}')
if last_pos > 0:
    before = content[:last_pos]
    after = content[last_pos:]
    overlay_render = '''      {/* Flow Detail Overlay */}
      {detailFlow && (
        <FlowDetailOverlay flow={detailFlow} onClose={() => setFlowDetailId(null)} />
      )}
'''
    content = before + overlay_render + after

with open(filepath, 'w') as f:
    f.write(content)

print("power-automate-client.tsx modified successfully")
