'use client';

import { useState } from 'react';
import {
  AppWindow, Plus, Search, MoreVertical, Users, Calendar, Database,
  ChevronRight, Eye, Edit3, Trash2, X, Type, Hash, ChevronDown, Upload,
  Table, CheckSquare, TextCursorInput, Mail as MailIcon, Image, Layers,
  Globe, Code, Play, ArrowLeft, Monitor, Receipt, CalendarOff,
  ClipboardList, Headphones, FileText, Settings, LayoutGrid,
  Smartphone, Tablet, RefreshCw, Wifi, WifiOff, ArrowUpDown, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePowerAppsStore, PowerApp, AppField, AppScreen } from '@/store/power-apps-store';

const fieldTypeIcons: Record<string, React.ElementType> = {
  text: Type,
  number: Hash,
  dropdown: ChevronDown,
  date: Calendar,
  file: Upload,
  checkbox: CheckSquare,
  textarea: TextCursorInput,
  email: MailIcon,
  gallery: Image,
  dataTable: Table,
};

const appIcons: Record<string, React.ElementType> = {
  receipt: Receipt,
  calendarOff: CalendarOff,
  monitor: Monitor,
  clipboardList: ClipboardList,
  headphones: Headphones,
};

const dataTableRows = [
  { title: 'Client dinner', amount: '$125.00', date: '03/20/2026', status: 'Approved' },
  { title: 'Software license', amount: '$499.00', date: '03/18/2026', status: 'Pending' },
  { title: 'Office supplies', amount: '$67.50', date: '03/15/2026', status: 'Approved' },
  { title: 'Conference travel', amount: '$1,250.00', date: '03/12/2026', status: 'Approved' },
  { title: 'Team lunch', amount: '$89.00', date: '03/10/2026', status: 'Pending' },
  { title: 'Cloud hosting', amount: '$320.00', date: '03/08/2026', status: 'Rejected' },
  { title: 'Marketing ads', amount: '$750.00', date: '03/05/2026', status: 'Approved' },
  { title: 'Printer ink', amount: '$45.00', date: '03/03/2026', status: 'Approved' },
];

type SortDir = 'asc' | 'desc' | null;

function DataTableRenderer() {
  const [searchFilter, setSearchFilter] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc');
      if (sortDir === 'desc') setSortCol(null);
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  let filtered = dataTableRows.filter((row) =>
    row.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    row.status.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (sortCol && sortDir) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, string>)[sortCol] ?? '';
      const bVal = (b as Record<string, string>)[sortCol] ?? '';
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safeP = Math.min(page, totalPages);
  const paged = filtered.slice((safeP - 1) * perPage, safeP * perPage);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div>
      {/* Search / filter */}
      <div className="relative mb-2">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
        <input
          className="w-full pl-8 pr-3 py-1.5 rounded border text-xs"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          placeholder="Filter rows..."
          value={searchFilter}
          onChange={(e) => { setSearchFilter(e.target.value); setPage(1); }}
        />
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--background)' }}>
              <th className="text-left px-3 py-2 text-xs font-semibold w-10" style={{ color: 'var(--muted-foreground)' }}>#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-3 py-2 text-xs font-semibold cursor-pointer select-none"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={11} className={cn('opacity-40', sortCol === col.key && 'opacity-100')} />
                    {sortCol === col.key && sortDir === 'asc' && <span className="text-[10px]">&#9650;</span>}
                    {sortCol === col.key && sortDir === 'desc' && <span className="text-[10px]">&#9660;</span>}
                  </span>
                </th>
              ))}
              <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{(safeP - 1) * perPage + i + 1}</td>
                <td className="px-3 py-2 text-sm" style={{ color: 'var(--foreground)' }}>{row.title}</td>
                <td className="px-3 py-2 text-sm" style={{ color: 'var(--foreground)' }}>{row.amount}</td>
                <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.date}</td>
                <td className="px-3 py-2">
                  <span className="text-xs px-2 py-0.5 rounded" style={{
                    backgroundColor: row.status === 'Approved' ? '#10b98120' : row.status === 'Pending' ? '#f59e0b20' : '#ef444420',
                    color: row.status === 'Approved' ? '#10b981' : row.status === 'Pending' ? '#f59e0b' : '#ef4444',
                  }}>{row.status}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded hover:opacity-80" style={{ color: 'var(--muted-foreground)' }} title="View">
                      <Eye size={13} />
                    </button>
                    <button className="p-1 rounded hover:opacity-80" style={{ color: 'var(--muted-foreground)' }} title="Edit">
                      <Edit3 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>No matching rows</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safeP <= 1}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded border disabled:opacity-40"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <ChevronLeft size={12} /> Previous
        </button>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Page {safeP} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safeP >= totalPages}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded border disabled:opacity-40"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function FieldRenderer({ field, preview }: { field: AppField; preview?: boolean }) {
  const [value, setValue] = useState(field.value ?? '');

  return (
    <div className={cn('mb-3', field.width === 'half' ? 'w-[calc(50%-0.375rem)]' : 'w-full')}>
      <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
        {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : field.type === 'textarea' ? (
        <textarea
          className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
          rows={3}
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : field.type === 'dropdown' ? (
        <select
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.type === 'date' ? (
        <input
          type="date"
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : field.type === 'file' ? (
        <div
          className="w-full px-3 py-4 rounded-lg border border-dashed text-center cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <Upload size={16} className="mx-auto mb-1" />
          <p className="text-xs">Click to upload or drag & drop</p>
        </div>
      ) : field.type === 'checkbox' ? (
        <div className="flex items-center gap-2 mt-1">
          <input type="checkbox" className="rounded" />
          <span className="text-sm" style={{ color: 'var(--foreground)' }}>{field.placeholder ?? 'Enabled'}</span>
        </div>
      ) : field.type === 'dataTable' ? (
        <DataTableRenderer />
      ) : null}
    </div>
  );
}

function ConnectionsPanel() {
  const dataSources = usePowerAppsStore.getState().dataSources;

  const connectionData = dataSources.map((ds) => {
    const connected = ds.connected;
    let health: 'Healthy' | 'Warning' | 'Error' = 'Healthy';
    let lastSync = '2 min ago';
    if (!connected) {
      health = 'Error';
      lastSync = 'Never';
    } else if (ds.name === 'Dataverse') {
      health = 'Warning';
      lastSync = '15 min ago';
    } else if (ds.name === 'SQL Server') {
      lastSync = '5 min ago';
    }
    return { ...ds, health, lastSync };
  });

  const healthColors: Record<string, { bg: string; fg: string }> = {
    Healthy: { bg: '#10b98120', fg: '#10b981' },
    Warning: { bg: '#f59e0b20', fg: '#f59e0b' },
    Error: { bg: '#ef444420', fg: '#ef4444' },
  };

  const dsIcons: Record<string, React.ElementType> = { globe: Globe, database: Database, layers: Layers, table: Table, sheet: FileText, code: Code };

  return (
    <div className="w-60 border-l overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Connections</p>
        <button className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ color: 'var(--sidebar-accent)' }}>
          <RefreshCw size={12} /> Refresh All
        </button>
      </div>
      {connectionData.map((ds) => {
        const Icon = dsIcons[ds.icon] ?? Database;
        const colors = healthColors[ds.health];
        return (
          <div key={ds.id} className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="relative">
                <Icon size={14} style={{ color: 'var(--sidebar-accent)' }} />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border"
                  style={{
                    backgroundColor: ds.connected ? '#10b981' : '#ef4444',
                    borderColor: 'var(--card)',
                  }}
                />
              </div>
              <span className="text-sm font-medium flex-1" style={{ color: 'var(--foreground)' }}>{ds.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.bg, color: colors.fg }}>
                {ds.health}
              </span>
            </div>
            <div className="ml-5 space-y-1">
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Type: {ds.type}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Status: {ds.connected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Last sync: {ds.lastSync}
              </p>
              <button
                className="text-xs px-2 py-1 rounded border mt-1"
                style={{ borderColor: 'var(--border)', color: 'var(--sidebar-accent)' }}
              >
                {ds.connected ? 'Test Connection' : 'Connect'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DataSourcesPanel() {
  const dsIcons: Record<string, React.ElementType> = { globe: Globe, database: Database, layers: Layers };
  return (
    <div className="w-60 border-l overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Data Sources</p>
      </div>
      {usePowerAppsStore.getState().dataSources.filter((ds) => ds.connected).map((ds) => {
        const Icon = dsIcons[ds.icon] ?? Database;
        return (
          <div key={ds.id} className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} style={{ color: 'var(--sidebar-accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{ds.name}</span>
            </div>
            {ds.tables && (
              <div className="ml-5 space-y-0.5">
                {ds.tables.map((t) => (
                  <p key={t} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeviceFrame({ device, children }: { device: 'phone' | 'tablet'; children: React.ReactNode }) {
  if (device === 'phone') {
    return (
      <div
        className="relative rounded-[2.5rem] border-[6px] shadow-2xl"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--border)',
          width: 375,
          minHeight: 667,
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ width: 120 }}>
          <div
            className="mx-auto rounded-b-2xl"
            style={{ width: 120, height: 24, backgroundColor: 'var(--border)' }}
          />
        </div>
        {/* Screen */}
        <div
          className="rounded-[2rem] overflow-y-auto"
          style={{ backgroundColor: 'var(--card)', minHeight: 655 }}
        >
          <div className="pt-8">{children}</div>
        </div>
        {/* Home bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <div
            className="rounded-full"
            style={{ width: 100, height: 4, backgroundColor: 'var(--muted-foreground)', opacity: 0.4 }}
          />
        </div>
      </div>
    );
  }

  // Tablet
  return (
    <div
      className="relative rounded-[1.5rem] border-[10px] shadow-2xl"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--border)',
        width: 768,
        minHeight: 560,
      }}
    >
      {/* Screen */}
      <div
        className="rounded-[0.75rem] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', minHeight: 540 }}
      >
        {children}
      </div>
    </div>
  );
}

function AppDesigner() {
  const {
    designerApp, setDesignerApp, activeScreenId, setActiveScreenId,
    selectedFieldId, setSelectedFieldId, previewMode, setPreviewMode,
    addFieldToScreen, removeFieldFromScreen, addScreen,
    previewDevice, setPreviewDevice, showConnectionsPanel, setShowConnectionsPanel,
  } = usePowerAppsStore();

  if (!designerApp) return null;

  const activeScreen = designerApp.screens.find((s) => s.id === activeScreenId);

  const handleAddField = (type: AppField['type']) => {
    if (!activeScreenId) return;
    const field: AppField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: `Enter ${type}...`,
      required: false,
      width: type === 'dataTable' || type === 'gallery' ? 'full' : 'half',
      options: type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };
    addFieldToScreen(activeScreenId, field);
  };

  const handleAddScreen = () => {
    addScreen({
      id: `scr-${Date.now()}`,
      name: `Screen ${designerApp.screens.length + 1}`,
      fields: [],
    });
  };

  if (previewMode) {
    const previewContent = (
      <div className="p-5">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--foreground)' }}>{activeScreen?.name ?? 'Screen'}</h2>
        <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>{designerApp.description}</p>
        <div className="flex flex-wrap gap-3">
          {activeScreen?.fields.map((field) => (
            <FieldRenderer key={field.id} field={field} preview />
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}>
            Submit
          </button>
          <button className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            Cancel
          </button>
        </div>
      </div>
    );

    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setPreviewMode(false)} className="p-1 rounded" style={{ color: 'var(--foreground)' }}><ArrowLeft size={18} /></button>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Preview: {designerApp.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Device toggle */}
            <div className="flex items-center rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setPreviewDevice('phone')}
                className={cn('flex items-center gap-1 px-3 py-1.5 text-xs transition-colors')}
                style={{
                  backgroundColor: previewDevice === 'phone' ? 'var(--sidebar-accent)' : 'transparent',
                  color: previewDevice === 'phone' ? 'var(--primary-foreground)' : 'var(--foreground)',
                }}
              >
                <Smartphone size={13} /> Phone
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={cn('flex items-center gap-1 px-3 py-1.5 text-xs transition-colors')}
                style={{
                  backgroundColor: previewDevice === 'tablet' ? 'var(--sidebar-accent)' : 'transparent',
                  color: previewDevice === 'tablet' ? 'var(--primary-foreground)' : 'var(--foreground)',
                }}
              >
                <Tablet size={13} /> Tablet
              </button>
            </div>
            <button onClick={() => setPreviewMode(false)} className="px-3 py-1.5 rounded text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              Exit Preview
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center p-8 overflow-y-auto">
          <DeviceFrame device={previewDevice}>
            {previewContent}
          </DeviceFrame>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Designer header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setDesignerApp(null)} className="p-1 rounded" style={{ color: 'var(--foreground)' }}><ArrowLeft size={18} /></button>
          <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>{designerApp.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConnectionsPanel(!showConnectionsPanel)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border')}
            style={{
              borderColor: showConnectionsPanel ? 'var(--sidebar-accent)' : 'var(--border)',
              color: showConnectionsPanel ? 'var(--sidebar-accent)' : 'var(--foreground)',
              backgroundColor: showConnectionsPanel ? 'var(--sidebar-accent)' + '15' : 'transparent',
            }}
          >
            {showConnectionsPanel ? <Wifi size={14} /> : <WifiOff size={14} />} Connections
          </button>
          <button onClick={() => setPreviewMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}>
            <Eye size={14} /> Preview
          </button>
          <button className="px-3 py-1.5 rounded text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <Settings size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Screens sidebar */}
        <div className="w-48 border-r overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Screens</p>
          </div>
          {designerApp.screens.map((scr) => (
            <button
              key={scr.id}
              onClick={() => setActiveScreenId(scr.id)}
              className={cn('w-full text-left px-3 py-2.5 text-sm border-b transition-colors')}
              style={{
                borderColor: 'var(--border)',
                backgroundColor: activeScreenId === scr.id ? 'var(--sidebar-accent)' + '20' : 'transparent',
                color: activeScreenId === scr.id ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              {scr.name}
            </button>
          ))}
          <button onClick={handleAddScreen} className="w-full flex items-center gap-1.5 px-3 py-2.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <Plus size={14} /> Add Screen
          </button>
        </div>

        {/* Form canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>{activeScreen?.name}</h3>
            <div className="flex flex-wrap gap-3">
              {activeScreen?.fields.map((field) => (
                <div
                  key={field.id}
                  className={cn(
                    'relative group',
                    field.width === 'half' ? 'w-[calc(50%-0.375rem)]' : 'w-full'
                  )}
                  onClick={() => setSelectedFieldId(field.id)}
                >
                  <div className={cn('rounded-lg border p-3 transition-colors')} style={{ borderColor: selectedFieldId === field.id ? 'var(--sidebar-accent)' : 'var(--border)', boxShadow: selectedFieldId === field.id ? '0 0 0 2px var(--sidebar-accent)' : 'none' }}>
                    <FieldRenderer field={field} />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (activeScreenId) removeFieldFromScreen(activeScreenId, field.id); }}
                    className="absolute -top-2 -right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: '#ef4444', color: 'white' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add field buttons */}
            <div className="mt-6 p-4 rounded-lg border border-dashed" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>Add Field</p>
              <div className="flex flex-wrap gap-2">
                {(['text', 'number', 'dropdown', 'date', 'file', 'checkbox', 'textarea', 'email'] as const).map((type) => {
                  const Icon = fieldTypeIcons[type];
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddField(type)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs capitalize"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
                    >
                      <Icon size={13} /> {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Connections or Data Sources */}
        {showConnectionsPanel ? <ConnectionsPanel /> : <DataSourcesPanel />}
      </div>
    </div>
  );
}

function AppCard({ app }: { app: PowerApp }) {
  const { setDesignerApp } = usePowerAppsStore();
  const statusColors: Record<string, string> = {
    published: '#10b981',
    draft: '#f59e0b',
    archived: '#6b7280',
  };
  const Icon = appIcons[app.icon] ?? AppWindow;

  return (
    <div
      className="rounded-lg border p-4 cursor-pointer hover:border-opacity-60 transition-colors"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      onClick={() => setDesignerApp(app)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--sidebar-accent)' + '20' }}>
          <Icon size={20} style={{ color: 'var(--sidebar-accent)' }} />
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: statusColors[app.status] + '20', color: statusColors[app.status] }}>
          {app.status}
        </span>
      </div>
      <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--foreground)' }}>{app.name}</h3>
      <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{app.description}</p>
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Users size={12} /> {app.users} users</span>
          <span className="flex items-center gap-1"><Database size={12} /> {app.dataSource}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <Calendar size={12} /> {new Date(app.lastModified).toLocaleDateString()}
        <span className="mx-1">·</span>
        {app.createdBy}
      </div>
    </div>
  );
}

export function PowerAppsClient() {
  const {
    apps, activeView, searchQuery, setSearchQuery, designerApp, previewMode,
  } = usePowerAppsStore();

  const filteredApps = apps.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if ((activeView === 'designer' || activeView === 'preview') && designerApp) {
    return <AppDesigner />;
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#7c3aed' }}>
            <AppWindow size={20} color="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Power Apps</h1>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Low-code app builder</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#7c3aed', color: 'white' }}>
          <Plus size={16} /> New App
        </button>
      </div>

      {/* Search */}
      <div className="px-6 pt-5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* App gallery */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--muted-foreground)' }}>APP GALLERY</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        {/* Data Sources */}
        <h2 className="text-sm font-semibold mt-8 mb-4" style={{ color: 'var(--muted-foreground)' }}>DATA SOURCES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {usePowerAppsStore.getState().dataSources.map((ds) => {
            const dsIcons: Record<string, React.ElementType> = { globe: Globe, database: Database, layers: Layers, table: Table, sheet: FileText, code: Code };
            const Icon = dsIcons[ds.icon] ?? Database;
            return (
              <div key={ds.id} className="rounded-lg border p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                  <Icon size={18} style={{ color: '#7c3aed' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{ds.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ds.type}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{
                  backgroundColor: ds.connected ? '#10b98120' : 'var(--background)',
                  color: ds.connected ? '#10b981' : 'var(--muted-foreground)',
                }}>
                  {ds.connected ? 'Connected' : 'Connect'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
