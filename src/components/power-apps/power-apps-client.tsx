'use client';

import { useState } from 'react';
import {
  AppWindow, Plus, Search, MoreVertical, Users, Calendar, Database,
  ChevronRight, Eye, Edit3, Trash2, X, Type, Hash, ChevronDown, Upload,
  Table, CheckSquare, TextCursorInput, Mail as MailIcon, Image, Layers,
  Globe, Code, Play, ArrowLeft, Monitor, Receipt, CalendarOff,
  ClipboardList, Headphones, FileText, Settings, LayoutGrid,
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
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--background)' }}>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Title</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Amount</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Date</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { title: 'Client dinner', amount: '$125.00', date: '03/20/2026', status: 'Approved' },
                { title: 'Software license', amount: '$499.00', date: '03/18/2026', status: 'Pending' },
                { title: 'Office supplies', amount: '$67.50', date: '03/15/2026', status: 'Approved' },
              ].map((row, i) => (
                <tr key={i} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3 py-2 text-sm" style={{ color: 'var(--foreground)' }}>{row.title}</td>
                  <td className="px-3 py-2 text-sm" style={{ color: 'var(--foreground)' }}>{row.amount}</td>
                  <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.date}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs px-2 py-0.5 rounded" style={{
                      backgroundColor: row.status === 'Approved' ? '#10b98120' : '#f59e0b20',
                      color: row.status === 'Approved' ? '#10b981' : '#f59e0b',
                    }}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function AppDesigner() {
  const { designerApp, setDesignerApp, activeScreenId, setActiveScreenId, selectedFieldId, setSelectedFieldId, previewMode, setPreviewMode, addFieldToScreen, removeFieldFromScreen, addScreen } = usePowerAppsStore();

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
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setPreviewMode(false)} className="p-1 rounded" style={{ color: 'var(--foreground)' }}><ArrowLeft size={18} /></button>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Preview: {designerApp.name}</h2>
          </div>
          <button onClick={() => setPreviewMode(false)} className="px-3 py-1.5 rounded text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            Exit Preview
          </button>
        </div>
        <div className="flex-1 flex items-start justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border shadow-lg p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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

        {/* Data sources panel */}
        <div className="w-60 border-l overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Data Sources</p>
          </div>
          {usePowerAppsStore.getState().dataSources.filter((ds) => ds.connected).map((ds) => {
            const dsIcons: Record<string, React.ElementType> = { globe: Globe, database: Database, layers: Layers };
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
