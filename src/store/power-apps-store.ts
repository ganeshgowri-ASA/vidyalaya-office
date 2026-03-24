'use client';
import { create } from 'zustand';

export interface AppField {
  id: string;
  type: 'text' | 'number' | 'dropdown' | 'date' | 'file' | 'checkbox' | 'textarea' | 'email' | 'gallery' | 'dataTable';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  width: 'full' | 'half';
  value?: string;
}

export interface AppScreen {
  id: string;
  name: string;
  fields: AppField[];
}

export interface PowerApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
  screens: AppScreen[];
  dataSource: string;
  lastModified: string;
  createdBy: string;
  users: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  icon: string;
  connected: boolean;
  tables?: string[];
}

interface PowerAppsState {
  apps: PowerApp[];
  dataSources: DataSource[];
  activeView: 'gallery' | 'designer' | 'preview' | 'data';
  selectedAppId: string | null;
  designerApp: PowerApp | null;
  activeScreenId: string | null;
  selectedFieldId: string | null;
  searchQuery: string;
  previewMode: boolean;

  setActiveView: (view: PowerAppsState['activeView']) => void;
  setSelectedAppId: (id: string | null) => void;
  setDesignerApp: (app: PowerApp | null) => void;
  setActiveScreenId: (id: string | null) => void;
  setSelectedFieldId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setPreviewMode: (preview: boolean) => void;
  addFieldToScreen: (screenId: string, field: AppField) => void;
  removeFieldFromScreen: (screenId: string, fieldId: string) => void;
  updateField: (screenId: string, fieldId: string, updates: Partial<AppField>) => void;
  addScreen: (screen: AppScreen) => void;
  deleteScreen: (screenId: string) => void;
}

const sampleApps: PowerApp[] = [
  {
    id: 'app-1',
    name: 'Expense Tracker',
    description: 'Track and manage employee expense reports with approval workflows',
    icon: 'receipt',
    category: 'Finance',
    status: 'published',
    screens: [
      {
        id: 'scr-1',
        name: 'Submit Expense',
        fields: [
          { id: 'f1', type: 'text', label: 'Expense Title', placeholder: 'Enter expense title', required: true, width: 'full' },
          { id: 'f2', type: 'number', label: 'Amount ($)', placeholder: '0.00', required: true, width: 'half' },
          { id: 'f3', type: 'dropdown', label: 'Category', required: true, options: ['Travel', 'Meals', 'Office Supplies', 'Software', 'Training', 'Other'], width: 'half' },
          { id: 'f4', type: 'date', label: 'Expense Date', required: true, width: 'half' },
          { id: 'f5', type: 'dropdown', label: 'Payment Method', required: true, options: ['Corporate Card', 'Personal Card', 'Cash', 'Bank Transfer'], width: 'half' },
          { id: 'f6', type: 'textarea', label: 'Description', placeholder: 'Describe the expense...', required: false, width: 'full' },
          { id: 'f7', type: 'file', label: 'Receipt', required: true, width: 'full' },
        ],
      },
      {
        id: 'scr-2',
        name: 'Expense History',
        fields: [
          { id: 'f8', type: 'dataTable', label: 'Recent Expenses', required: false, width: 'full' },
        ],
      },
    ],
    dataSource: 'SharePoint List',
    lastModified: '2026-03-22T14:30:00Z',
    createdBy: 'Sarah Chen',
    users: 45,
  },
  {
    id: 'app-2',
    name: 'Leave Request',
    description: 'Employee leave management with calendar view and manager approvals',
    icon: 'calendarOff',
    category: 'HR',
    status: 'published',
    screens: [
      {
        id: 'scr-1',
        name: 'Request Leave',
        fields: [
          { id: 'f1', type: 'dropdown', label: 'Leave Type', required: true, options: ['Annual Leave', 'Sick Leave', 'Personal Day', 'Bereavement', 'Parental Leave'], width: 'full' },
          { id: 'f2', type: 'date', label: 'Start Date', required: true, width: 'half' },
          { id: 'f3', type: 'date', label: 'End Date', required: true, width: 'half' },
          { id: 'f4', type: 'textarea', label: 'Reason', placeholder: 'Optional reason...', required: false, width: 'full' },
          { id: 'f5', type: 'file', label: 'Supporting Document', required: false, width: 'full' },
        ],
      },
    ],
    dataSource: 'SQL Database',
    lastModified: '2026-03-21T10:00:00Z',
    createdBy: 'James Wilson',
    users: 120,
  },
  {
    id: 'app-3',
    name: 'Asset Manager',
    description: 'Track company assets, equipment assignments, and maintenance schedules',
    icon: 'monitor',
    category: 'Operations',
    status: 'published',
    screens: [
      {
        id: 'scr-1',
        name: 'Register Asset',
        fields: [
          { id: 'f1', type: 'text', label: 'Asset Name', placeholder: 'e.g., MacBook Pro 16"', required: true, width: 'full' },
          { id: 'f2', type: 'text', label: 'Asset Tag', placeholder: 'AST-0001', required: true, width: 'half' },
          { id: 'f3', type: 'dropdown', label: 'Category', required: true, options: ['Laptop', 'Monitor', 'Phone', 'Furniture', 'Vehicle', 'Software License'], width: 'half' },
          { id: 'f4', type: 'text', label: 'Assigned To', placeholder: 'Employee name', required: false, width: 'half' },
          { id: 'f5', type: 'date', label: 'Purchase Date', required: true, width: 'half' },
          { id: 'f6', type: 'number', label: 'Purchase Price ($)', placeholder: '0.00', required: true, width: 'half' },
          { id: 'f7', type: 'dropdown', label: 'Condition', required: true, options: ['New', 'Good', 'Fair', 'Poor', 'Retired'], width: 'half' },
        ],
      },
    ],
    dataSource: 'Dataverse',
    lastModified: '2026-03-19T16:00:00Z',
    createdBy: 'Mike Johnson',
    users: 30,
  },
  {
    id: 'app-4',
    name: 'Survey Builder',
    description: 'Create and distribute surveys with real-time response analytics',
    icon: 'clipboardList',
    category: 'Research',
    status: 'draft',
    screens: [
      {
        id: 'scr-1',
        name: 'Survey Form',
        fields: [
          { id: 'f1', type: 'text', label: 'Survey Title', placeholder: 'Enter survey title', required: true, width: 'full' },
          { id: 'f2', type: 'textarea', label: 'Description', placeholder: 'Survey description...', required: false, width: 'full' },
          { id: 'f3', type: 'dropdown', label: 'Question Type', required: true, options: ['Multiple Choice', 'Rating Scale', 'Open Text', 'Yes/No', 'Ranking'], width: 'half' },
          { id: 'f4', type: 'text', label: 'Question Text', placeholder: 'Enter your question', required: true, width: 'full' },
        ],
      },
    ],
    dataSource: 'SharePoint List',
    lastModified: '2026-03-18T09:30:00Z',
    createdBy: 'Emily Davis',
    users: 0,
  },
  {
    id: 'app-5',
    name: 'Helpdesk',
    description: 'IT support ticket management with SLA tracking and knowledge base',
    icon: 'headphones',
    category: 'IT',
    status: 'published',
    screens: [
      {
        id: 'scr-1',
        name: 'New Ticket',
        fields: [
          { id: 'f1', type: 'text', label: 'Subject', placeholder: 'Brief description of issue', required: true, width: 'full' },
          { id: 'f2', type: 'dropdown', label: 'Priority', required: true, options: ['Low', 'Medium', 'High', 'Critical'], width: 'half' },
          { id: 'f3', type: 'dropdown', label: 'Category', required: true, options: ['Hardware', 'Software', 'Network', 'Account Access', 'Email', 'Other'], width: 'half' },
          { id: 'f4', type: 'textarea', label: 'Description', placeholder: 'Describe the issue in detail...', required: true, width: 'full' },
          { id: 'f5', type: 'file', label: 'Screenshot', required: false, width: 'full' },
        ],
      },
    ],
    dataSource: 'SQL Database',
    lastModified: '2026-03-23T11:00:00Z',
    createdBy: 'Alex Thompson',
    users: 200,
  },
];

const sampleDataSources: DataSource[] = [
  { id: 'ds1', name: 'SharePoint', type: 'SharePoint List', icon: 'globe', connected: true, tables: ['Expenses', 'Surveys', 'Documents'] },
  { id: 'ds2', name: 'SQL Server', type: 'SQL Database', icon: 'database', connected: true, tables: ['Employees', 'LeaveRequests', 'Tickets'] },
  { id: 'ds3', name: 'Dataverse', type: 'Dataverse', icon: 'layers', connected: true, tables: ['Assets', 'Contacts', 'Accounts'] },
  { id: 'ds4', name: 'Excel Online', type: 'Excel', icon: 'table', connected: false },
  { id: 'ds5', name: 'Google Sheets', type: 'Google Sheets', icon: 'sheet', connected: false },
  { id: 'ds6', name: 'REST API', type: 'Custom API', icon: 'code', connected: false },
];

export const usePowerAppsStore = create<PowerAppsState>((set) => ({
  apps: sampleApps,
  dataSources: sampleDataSources,
  activeView: 'gallery',
  selectedAppId: null,
  designerApp: null,
  activeScreenId: null,
  selectedFieldId: null,
  searchQuery: '',
  previewMode: false,

  setActiveView: (view) => set({ activeView: view }),
  setSelectedAppId: (id) => set({ selectedAppId: id }),
  setDesignerApp: (app) =>
    set({
      designerApp: app,
      activeView: app ? 'designer' : 'gallery',
      activeScreenId: app?.screens[0]?.id ?? null,
    }),
  setActiveScreenId: (id) => set({ activeScreenId: id }),
  setSelectedFieldId: (id) => set({ selectedFieldId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPreviewMode: (preview) => set({ previewMode: preview, activeView: preview ? 'preview' : 'designer' }),

  addFieldToScreen: (screenId, field) =>
    set((s) => {
      if (!s.designerApp) return s;
      return {
        designerApp: {
          ...s.designerApp,
          screens: s.designerApp.screens.map((scr) =>
            scr.id === screenId ? { ...scr, fields: [...scr.fields, field] } : scr
          ),
        },
      };
    }),

  removeFieldFromScreen: (screenId, fieldId) =>
    set((s) => {
      if (!s.designerApp) return s;
      return {
        designerApp: {
          ...s.designerApp,
          screens: s.designerApp.screens.map((scr) =>
            scr.id === screenId
              ? { ...scr, fields: scr.fields.filter((f) => f.id !== fieldId) }
              : scr
          ),
        },
      };
    }),

  updateField: (screenId, fieldId, updates) =>
    set((s) => {
      if (!s.designerApp) return s;
      return {
        designerApp: {
          ...s.designerApp,
          screens: s.designerApp.screens.map((scr) =>
            scr.id === screenId
              ? { ...scr, fields: scr.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)) }
              : scr
          ),
        },
      };
    }),

  addScreen: (screen) =>
    set((s) => {
      if (!s.designerApp) return s;
      return {
        designerApp: {
          ...s.designerApp,
          screens: [...s.designerApp.screens, screen],
        },
        activeScreenId: screen.id,
      };
    }),

  deleteScreen: (screenId) =>
    set((s) => {
      if (!s.designerApp) return s;
      const screens = s.designerApp.screens.filter((scr) => scr.id !== screenId);
      return {
        designerApp: { ...s.designerApp, screens },
        activeScreenId: screens[0]?.id ?? null,
      };
    }),
}));
