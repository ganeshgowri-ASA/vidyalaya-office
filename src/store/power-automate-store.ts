'use client';
import { create } from 'zustand';

export interface FlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'loop' | 'delay' | 'end';
  label: string;
  description: string;
  icon: string;
  x: number;
  y: number;
  config: Record<string, string>;
  connectorType?: string;
}

export interface FlowConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  trigger: string;
  lastRun?: string;
  runCount: number;
  nodes: FlowNode[];
  connections: FlowConnection[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
}

export interface FlowRun {
  id: string;
  flowId: string;
  flowName: string;
  status: 'succeeded' | 'failed' | 'running' | 'cancelled';
  startTime: string;
  duration: string;
  trigger: string;
}

export interface Connector {
  id: string;
  name: string;
  icon: string;
  category: string;
  connected: boolean;
}

interface PowerAutomateState {
  flows: Flow[];
  templates: FlowTemplate[];
  flowRuns: FlowRun[];
  connectors: Connector[];
  activeView: 'my-flows' | 'templates' | 'runs' | 'connectors' | 'designer' | 'analytics';
  selectedFlowId: string | null;
  designerFlow: Flow | null;
  selectedNodeId: string | null;
  searchQuery: string;
  showExpressionEditor: boolean;
  expressionValue: string;
  showToolbox: boolean;

  setActiveView: (view: PowerAutomateState['activeView']) => void;
  setSelectedFlowId: (id: string | null) => void;
  setDesignerFlow: (flow: Flow | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setShowExpressionEditor: (show: boolean) => void;
  setExpressionValue: (value: string) => void;
  setShowToolbox: (show: boolean) => void;
  toggleFlowStatus: (id: string) => void;
  addNodeToDesigner: (node: FlowNode) => void;
  removeNodeFromDesigner: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  createFlowFromTemplate: (templateId: string) => void;
}

const sampleFlows: Flow[] = [
  {
    id: 'flow-1',
    name: 'Document Approval Workflow',
    description: 'Routes documents for approval when uploaded to SharePoint',
    status: 'active',
    trigger: 'When a file is created in SharePoint',
    lastRun: '2026-03-24T09:30:00Z',
    runCount: 142,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'File Created', description: 'SharePoint file upload', icon: 'upload', x: 400, y: 60, config: { library: 'Documents' } },
      { id: 'n2', type: 'condition', label: 'Check File Type', description: 'Is it a PDF or DOCX?', icon: 'gitBranch', x: 400, y: 180, config: { field: 'fileType', operator: 'in', value: 'pdf,docx' } },
      { id: 'n3', type: 'action', label: 'Send Approval', description: 'Send approval request via email', icon: 'mail', x: 400, y: 300, config: { to: 'manager@company.com' } },
      { id: 'n4', type: 'action', label: 'Update Status', description: 'Mark document as approved', icon: 'checkCircle', x: 400, y: 420, config: { status: 'Approved' } },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', label: 'Yes' },
      { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4' },
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'flow-2',
    name: 'Email Notification on Form Submit',
    description: 'Sends email notifications when a form is submitted',
    status: 'active',
    trigger: 'When a form response is submitted',
    lastRun: '2026-03-24T08:15:00Z',
    runCount: 89,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Form Submitted', description: 'New form response', icon: 'fileText', x: 400, y: 60, config: { form: 'Contact Form' } },
      { id: 'n2', type: 'action', label: 'Send Email', description: 'Notify admin team', icon: 'mail', x: 400, y: 180, config: { to: 'admin@company.com' } },
    ],
    connections: [{ id: 'c1', fromNodeId: 'n1', toNodeId: 'n2' }],
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-03-22T11:00:00Z',
  },
  {
    id: 'flow-3',
    name: 'Daily Data Sync',
    description: 'Syncs data from Excel to database every day at 6 AM',
    status: 'active',
    trigger: 'Scheduled - Daily at 6:00 AM',
    lastRun: '2026-03-24T06:00:00Z',
    runCount: 67,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Schedule', description: 'Daily at 6:00 AM', icon: 'clock', x: 400, y: 60, config: { frequency: 'daily', time: '06:00' } },
      { id: 'n2', type: 'action', label: 'Get Excel Data', description: 'Read from spreadsheet', icon: 'table', x: 400, y: 180, config: { file: 'SalesData.xlsx' } },
      { id: 'n3', type: 'loop', label: 'For Each Row', description: 'Process each data row', icon: 'repeat', x: 400, y: 300, config: {} },
      { id: 'n4', type: 'action', label: 'Upsert Record', description: 'Update or insert into DB', icon: 'database', x: 400, y: 420, config: { table: 'sales_records' } },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3' },
      { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4' },
    ],
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'flow-4',
    name: 'Task Assignment on Issue Create',
    description: 'Auto-assigns tasks when new issues are created',
    status: 'inactive',
    trigger: 'When an issue is created',
    lastRun: '2026-03-10T16:45:00Z',
    runCount: 34,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Issue Created', description: 'New issue in tracker', icon: 'alertCircle', x: 400, y: 60, config: {} },
      { id: 'n2', type: 'condition', label: 'Check Priority', description: 'Is high priority?', icon: 'gitBranch', x: 400, y: 180, config: { field: 'priority', operator: 'equals', value: 'high' } },
      { id: 'n3', type: 'action', label: 'Assign to Lead', description: 'Assign to team lead', icon: 'userPlus', x: 300, y: 300, config: { assignee: 'team-lead' } },
      { id: 'n4', type: 'action', label: 'Add to Queue', description: 'Add to normal queue', icon: 'list', x: 500, y: 300, config: { queue: 'general' } },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', label: 'Yes' },
      { id: 'c3', fromNodeId: 'n2', toNodeId: 'n4', label: 'No' },
    ],
    createdAt: '2026-02-28T12:00:00Z',
    updatedAt: '2026-03-10T16:45:00Z',
  },
  {
    id: 'flow-5',
    name: 'Scheduled Report Generator',
    description: 'Generates and emails weekly reports every Monday',
    status: 'draft',
    trigger: 'Scheduled - Weekly on Monday',
    runCount: 0,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Schedule', description: 'Every Monday 8 AM', icon: 'clock', x: 400, y: 60, config: { frequency: 'weekly', day: 'Monday' } },
      { id: 'n2', type: 'action', label: 'Query Data', description: 'Get weekly metrics', icon: 'database', x: 400, y: 180, config: {} },
      { id: 'n3', type: 'action', label: 'Generate Report', description: 'Create PDF report', icon: 'fileText', x: 400, y: 300, config: {} },
      { id: 'n4', type: 'action', label: 'Send Report', description: 'Email to stakeholders', icon: 'mail', x: 400, y: 420, config: {} },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3' },
      { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4' },
    ],
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
];

const sampleTemplates: FlowTemplate[] = [
  { id: 't1', name: 'Document Approval', description: 'Route documents through an approval chain', category: 'Approval', icon: 'clipboardCheck', nodes: [], connections: [] },
  { id: 't2', name: 'Email Notification', description: 'Send automated email notifications on events', category: 'Notification', icon: 'mail', nodes: [], connections: [] },
  { id: 't3', name: 'Data Sync', description: 'Synchronize data between systems on a schedule', category: 'Data', icon: 'refreshCw', nodes: [], connections: [] },
  { id: 't4', name: 'Scheduled Task', description: 'Run tasks on a recurring schedule', category: 'Schedule', icon: 'clock', nodes: [], connections: [] },
  { id: 't5', name: 'Form Processing', description: 'Process form submissions and route data', category: 'Forms', icon: 'fileText', nodes: [], connections: [] },
  { id: 't6', name: 'File Backup', description: 'Automatically backup files to cloud storage', category: 'Data', icon: 'hardDrive', nodes: [], connections: [] },
  { id: 't7', name: 'Team Notification', description: 'Notify team channels on important events', category: 'Notification', icon: 'messageSquare', nodes: [], connections: [] },
  { id: 't8', name: 'Lead Capture', description: 'Capture leads from forms and add to CRM', category: 'Sales', icon: 'userPlus', nodes: [], connections: [] },
];

const sampleRuns: FlowRun[] = [
  { id: 'r1', flowId: 'flow-1', flowName: 'Document Approval Workflow', status: 'succeeded', startTime: '2026-03-24T09:30:00Z', duration: '12s', trigger: 'File upload' },
  { id: 'r2', flowId: 'flow-2', flowName: 'Email Notification on Form Submit', status: 'succeeded', startTime: '2026-03-24T08:15:00Z', duration: '3s', trigger: 'Form submission' },
  { id: 'r3', flowId: 'flow-3', flowName: 'Daily Data Sync', status: 'succeeded', startTime: '2026-03-24T06:00:00Z', duration: '45s', trigger: 'Schedule' },
  { id: 'r4', flowId: 'flow-1', flowName: 'Document Approval Workflow', status: 'failed', startTime: '2026-03-23T16:20:00Z', duration: '8s', trigger: 'File upload' },
  { id: 'r5', flowId: 'flow-3', flowName: 'Daily Data Sync', status: 'succeeded', startTime: '2026-03-23T06:00:00Z', duration: '52s', trigger: 'Schedule' },
  { id: 'r6', flowId: 'flow-2', flowName: 'Email Notification on Form Submit', status: 'succeeded', startTime: '2026-03-23T14:10:00Z', duration: '2s', trigger: 'Form submission' },
  { id: 'r7', flowId: 'flow-1', flowName: 'Document Approval Workflow', status: 'running', startTime: '2026-03-24T10:05:00Z', duration: '—', trigger: 'File upload' },
  { id: 'r8', flowId: 'flow-4', flowName: 'Task Assignment on Issue Create', status: 'cancelled', startTime: '2026-03-10T16:45:00Z', duration: '1s', trigger: 'Issue created' },
  { id: 'r9', flowId: 'flow-1', flowName: 'Document Approval Workflow', status: 'succeeded', startTime: '2026-03-22T11:10:00Z', duration: '9s', trigger: 'File upload' },
  { id: 'r10', flowId: 'flow-3', flowName: 'Daily Data Sync', status: 'failed', startTime: '2026-03-22T06:00:00Z', duration: '15s', trigger: 'Schedule' },
  { id: 'r11', flowId: 'flow-2', flowName: 'Email Notification on Form Submit', status: 'succeeded', startTime: '2026-03-21T09:45:00Z', duration: '2s', trigger: 'Form submission' },
  { id: 'r12', flowId: 'flow-1', flowName: 'Document Approval Workflow', status: 'succeeded', startTime: '2026-03-21T15:30:00Z', duration: '10s', trigger: 'File upload' },
  { id: 'r13', flowId: 'flow-3', flowName: 'Daily Data Sync', status: 'succeeded', startTime: '2026-03-21T06:00:00Z', duration: '38s', trigger: 'Schedule' },
  { id: 'r14', flowId: 'flow-1', flowName: 'Document Approval Workflow', status: 'failed', startTime: '2026-03-20T14:00:00Z', duration: '5s', trigger: 'File upload' },
];

const sampleConnectors: Connector[] = [
  { id: 'cn1', name: 'SharePoint', icon: 'globe', category: 'Microsoft', connected: true },
  { id: 'cn2', name: 'Outlook Email', icon: 'mail', category: 'Microsoft', connected: true },
  { id: 'cn3', name: 'OneDrive', icon: 'hardDrive', category: 'Microsoft', connected: true },
  { id: 'cn4', name: 'Excel Online', icon: 'table', category: 'Microsoft', connected: false },
  { id: 'cn5', name: 'Teams', icon: 'messageSquare', category: 'Microsoft', connected: true },
  { id: 'cn6', name: 'Custom API', icon: 'code', category: 'Custom', connected: false },
  { id: 'cn7', name: 'SQL Server', icon: 'database', category: 'Data', connected: false },
  { id: 'cn8', name: 'Google Sheets', icon: 'table', category: 'Google', connected: false },
  { id: 'cn9', name: 'Slack', icon: 'messageSquare', category: 'Communication', connected: false },
  { id: 'cn10', name: 'Salesforce', icon: 'cloud', category: 'CRM', connected: false },
];

export const usePowerAutomateStore = create<PowerAutomateState>((set, get) => ({
  flows: sampleFlows,
  templates: sampleTemplates,
  flowRuns: sampleRuns,
  connectors: sampleConnectors,
  activeView: 'my-flows',
  selectedFlowId: null,
  designerFlow: null,
  selectedNodeId: null,
  searchQuery: '',
  showExpressionEditor: false,
  expressionValue: '',
  showToolbox: true,

  setActiveView: (view) => set({ activeView: view }),
  setShowExpressionEditor: (show) => set({ showExpressionEditor: show }),
  setExpressionValue: (value) => set({ expressionValue: value }),
  setShowToolbox: (show) => set({ showToolbox: show }),
  setSelectedFlowId: (id) => set({ selectedFlowId: id }),
  setDesignerFlow: (flow) => set({ designerFlow: flow, activeView: 'designer' }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleFlowStatus: (id) =>
    set((s) => ({
      flows: s.flows.map((f) =>
        f.id === id
          ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' as Flow['status'] }
          : f
      ),
    })),

  addNodeToDesigner: (node) =>
    set((s) => {
      if (!s.designerFlow) return s;
      return {
        designerFlow: {
          ...s.designerFlow,
          nodes: [...s.designerFlow.nodes, node],
        },
      };
    }),

  removeNodeFromDesigner: (nodeId) =>
    set((s) => {
      if (!s.designerFlow) return s;
      return {
        designerFlow: {
          ...s.designerFlow,
          nodes: s.designerFlow.nodes.filter((n) => n.id !== nodeId),
          connections: s.designerFlow.connections.filter(
            (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
          ),
        },
      };
    }),

  updateNodePosition: (nodeId, x, y) =>
    set((s) => {
      if (!s.designerFlow) return s;
      return {
        designerFlow: {
          ...s.designerFlow,
          nodes: s.designerFlow.nodes.map((n) =>
            n.id === nodeId ? { ...n, x, y } : n
          ),
        },
      };
    }),

  createFlowFromTemplate: (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;
    const newFlow: Flow = {
      id: `flow-${Date.now()}`,
      name: `${template.name} (Copy)`,
      description: template.description,
      status: 'draft',
      trigger: 'Not configured',
      runCount: 0,
      nodes: template.nodes,
      connections: template.connections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({
      flows: [...s.flows, newFlow],
      designerFlow: newFlow,
      activeView: 'designer',
    }));
  },
}));
