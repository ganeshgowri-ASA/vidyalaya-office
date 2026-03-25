'use client';

import {
  Type, Hash, ChevronDown, Calendar, Upload, CheckSquare,
  TextCursorInput, Mail as MailIcon, Image, Table, GripVertical,
} from 'lucide-react';
import { usePowerAppsStore, AppField } from '@/store/power-apps-store';

const fieldTypes: { type: AppField['type']; label: string; icon: React.ElementType }[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'file', label: 'File', icon: Upload },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'textarea', label: 'Text Area', icon: TextCursorInput },
  { type: 'email', label: 'Email', icon: MailIcon },
  { type: 'gallery', label: 'Gallery', icon: Image },
  { type: 'dataTable', label: 'Data Table', icon: Table },
];

export function ComponentToolbar() {
  const { activeScreenId, addFieldToScreen } = usePowerAppsStore();

  const handleAdd = (type: AppField['type']) => {
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

  const handleDragStart = (e: React.DragEvent, type: AppField['type']) => {
    e.dataTransfer.setData('application/x-new-field-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="border-b px-4 py-2 flex items-center gap-1.5 overflow-x-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      <span className="text-[10px] font-semibold uppercase mr-1 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>Components</span>
      {fieldTypes.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          draggable
          onDragStart={(e) => handleDragStart(e, type)}
          onClick={() => handleAdd(type)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs flex-shrink-0 cursor-grab active:cursor-grabbing hover:border-opacity-60 transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
          title={`Drag or click to add ${label}`}
        >
          <GripVertical size={10} style={{ color: 'var(--muted-foreground)' }} />
          <Icon size={12} />
          {label}
        </button>
      ))}
    </div>
  );
}
