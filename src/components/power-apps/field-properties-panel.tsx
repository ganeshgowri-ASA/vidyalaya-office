'use client';

import { useState } from 'react';
import {
  X, Plus, Trash2, ChevronDown, ToggleLeft, ToggleRight,
  Type, Hash, Calendar, Upload, CheckSquare, TextCursorInput,
  Mail as MailIcon, Image, Table, GripVertical,
} from 'lucide-react';
import { usePowerAppsStore, AppField } from '@/store/power-apps-store';

const fieldTypeOptions: { value: AppField['type']; label: string; icon: React.ElementType }[] = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'file', label: 'File Upload', icon: Upload },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'textarea', label: 'Text Area', icon: TextCursorInput },
  { value: 'email', label: 'Email', icon: MailIcon },
  { value: 'gallery', label: 'Gallery', icon: Image },
  { value: 'dataTable', label: 'Data Table', icon: Table },
];

export function FieldPropertiesPanel() {
  const {
    selectedFieldId, setSelectedFieldId, activeScreenId, designerApp, updateField,
  } = usePowerAppsStore();

  const [newOption, setNewOption] = useState('');

  const activeScreen = designerApp?.screens.find((s) => s.id === activeScreenId);
  const selectedField = activeScreen?.fields.find((f) => f.id === selectedFieldId);

  if (!selectedField || !activeScreenId) {
    return (
      <div className="w-64 border-l overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Properties</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Select a field to edit its properties</p>
        </div>
      </div>
    );
  }

  const update = (updates: Partial<AppField>) => {
    updateField(activeScreenId, selectedField.id, updates);
  };

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    const current = selectedField.options ?? [];
    update({ options: [...current, trimmed] });
    setNewOption('');
  };

  const handleRemoveOption = (idx: number) => {
    const current = selectedField.options ?? [];
    update({ options: current.filter((_, i) => i !== idx) });
  };

  const handleUpdateOption = (idx: number, val: string) => {
    const current = [...(selectedField.options ?? [])];
    current[idx] = val;
    update({ options: current });
  };

  return (
    <div className="w-64 border-l overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Field Properties</p>
        <button
          onClick={() => setSelectedFieldId(null)}
          className="p-0.5 rounded hover:opacity-80"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Label */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Label</label>
          <input
            className="w-full px-2.5 py-1.5 rounded border text-sm"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            value={selectedField.label}
            onChange={(e) => update({ label: e.target.value })}
          />
        </div>

        {/* Placeholder */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Placeholder</label>
          <input
            className="w-full px-2.5 py-1.5 rounded border text-sm"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            value={selectedField.placeholder ?? ''}
            onChange={(e) => update({ placeholder: e.target.value })}
          />
        </div>

        {/* Field Type */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Field Type</label>
          <select
            className="w-full px-2.5 py-1.5 rounded border text-sm"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            value={selectedField.type}
            onChange={(e) => {
              const newType = e.target.value as AppField['type'];
              const updates: Partial<AppField> = { type: newType };
              if (newType === 'dropdown' && !selectedField.options) {
                updates.options = ['Option 1', 'Option 2', 'Option 3'];
              }
              if (newType === 'dataTable' || newType === 'gallery') {
                updates.width = 'full';
              }
              update(updates);
            }}
          >
            {fieldTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Required</label>
          <button
            onClick={() => update({ required: !selectedField.required })}
            className="p-0.5"
            style={{ color: selectedField.required ? 'var(--sidebar-accent)' : 'var(--muted-foreground)' }}
          >
            {selectedField.required ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>

        {/* Width */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Width</label>
          <div className="flex rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => update({ width: 'full' })}
              className="flex-1 px-2 py-1.5 text-xs transition-colors"
              style={{
                backgroundColor: selectedField.width === 'full' ? 'var(--sidebar-accent)' : 'var(--background)',
                color: selectedField.width === 'full' ? 'var(--primary-foreground)' : 'var(--foreground)',
              }}
            >
              Full
            </button>
            <button
              onClick={() => update({ width: 'half' })}
              className="flex-1 px-2 py-1.5 text-xs transition-colors border-l"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: selectedField.width === 'half' ? 'var(--sidebar-accent)' : 'var(--background)',
                color: selectedField.width === 'half' ? 'var(--primary-foreground)' : 'var(--foreground)',
              }}
            >
              Half
            </button>
          </div>
        </div>

        {/* Dropdown Options */}
        {selectedField.type === 'dropdown' && (
          <div>
            <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Options</label>
            <div className="space-y-1.5 mb-2">
              {(selectedField.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <GripVertical size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  <input
                    className="flex-1 px-2 py-1 rounded border text-xs"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    value={opt}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                  />
                  <button
                    onClick={() => handleRemoveOption(idx)}
                    className="p-0.5 rounded hover:opacity-80 flex-shrink-0"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <input
                className="flex-1 px-2 py-1 rounded border text-xs"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                placeholder="New option..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddOption(); }}
              />
              <button
                onClick={handleAddOption}
                className="p-1 rounded"
                style={{ color: 'var(--sidebar-accent)' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
