#!/usr/bin/env python3
"""Modify power-apps-client.tsx to add desktop preview, calendar date picker, file drag-drop, and interactive fields."""

filepath = 'src/components/power-apps/power-apps-client.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add useRef and useEffect to imports
content = content.replace(
    "import { useState } from 'react';",
    "import { useState, useRef, useEffect, useCallback } from 'react';"
)

# 2. Replace FieldRenderer to add calendar popup for date, drag-drop for file, interactive fields
old_field_renderer = '''function FieldRenderer({ field, preview }: { field: AppField; preview?: boolean }) {
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
}'''

new_field_renderer = '''function CalendarPopup({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(value ? new Date(value).getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? new Date(value).getMonth() : today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleSelect = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    onClose();
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectedDay = value ? new Date(value).getDate() : -1;
  const selectedMonth = value ? new Date(value).getMonth() : -1;
  const selectedYear = value ? new Date(value).getFullYear() : -1;

  return (
    <div className="absolute z-50 mt-1 rounded-lg border shadow-xl p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', width: 260 }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 rounded hover:opacity-80" style={{ color: 'var(--foreground)' }}>
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{monthNames[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:opacity-80" style={{ color: 'var(--foreground)' }}>
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: 'var(--muted-foreground)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected = day === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              className="text-xs py-1.5 rounded hover:opacity-80 transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--sidebar-accent)' : isToday ? 'var(--sidebar-accent)' + '20' : 'transparent',
                color: isSelected ? 'var(--primary-foreground)' : 'var(--foreground)',
                fontWeight: isToday ? 600 : 400,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t flex justify-between" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => { const t = today; handleSelect(t.getDate()); setViewMonth(t.getMonth()); setViewYear(t.getFullYear()); }} className="text-xs" style={{ color: 'var(--sidebar-accent)' }}>Today</button>
        <button onClick={() => { onChange(''); onClose(); }} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Clear</button>
      </div>
    </div>
  );
}

function FileDropZone() {
  const [files, setFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (name: string) => {
    setFiles((prev) => [...prev, name]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Simulate file drop
    const items = e.dataTransfer.files;
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        simulateUpload(items[i].name);
      }
    } else {
      simulateUpload(`File_${Date.now().toString(36)}.pdf`);
    }
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (inputFiles) {
      for (let i = 0; i < inputFiles.length; i++) {
        simulateUpload(inputFiles[i].name);
      }
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div
        className="w-full px-3 py-4 rounded-lg border border-dashed text-center cursor-pointer transition-colors"
        style={{
          borderColor: isDragging ? 'var(--sidebar-accent)' : 'var(--border)',
          backgroundColor: isDragging ? 'var(--sidebar-accent)' + '08' : 'transparent',
          color: 'var(--muted-foreground)',
        }}
        onClick={handleClick}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload size={16} className="mx-auto mb-1" />
        <p className="text-xs">{isDragging ? 'Drop files here...' : 'Click to upload or drag & drop'}</p>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
      </div>
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded border text-xs" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <FileText size={12} style={{ color: 'var(--sidebar-accent)' }} />
              <span className="flex-1 truncate" style={{ color: 'var(--foreground)' }}>{name}</span>
              <span className="text-[10px]" style={{ color: '#10b981' }}>Uploaded</span>
              <button onClick={() => removeFile(idx)} className="p-0.5 rounded hover:opacity-80" style={{ color: 'var(--muted-foreground)' }}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldRenderer({ field, preview }: { field: AppField; preview?: boolean }) {
  const [value, setValue] = useState(field.value ?? '');
  const [showCalendar, setShowCalendar] = useState(false);
  const [checked, setChecked] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  const formatDate = (v: string) => {
    if (!v) return '';
    const d = new Date(v);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn('mb-3', field.width === 'half' ? 'w-[calc(50%-0.375rem)]' : 'w-full')}>
      <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
        {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {field.type === 'text' || field.type === 'email' ? (
        <input
          type={field.type === 'email' ? 'email' : 'text'}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : field.type === 'number' ? (
        <input
          type="number"
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
        <div className="relative" ref={calRef}>
          <div
            className="w-full px-3 py-2 rounded-lg border text-sm flex items-center justify-between cursor-pointer"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: value ? 'var(--foreground)' : 'var(--muted-foreground)' }}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <span>{value ? formatDate(value) : 'Select date...'}</span>
            <Calendar size={14} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          {showCalendar && (
            <CalendarPopup
              value={value}
              onChange={(v) => setValue(v)}
              onClose={() => setShowCalendar(false)}
            />
          )}
        </div>
      ) : field.type === 'file' ? (
        <FileDropZone />
      ) : field.type === 'checkbox' ? (
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => setChecked(!checked)}
            className="w-4 h-4 rounded border flex items-center justify-center"
            style={{
              borderColor: checked ? 'var(--sidebar-accent)' : 'var(--border)',
              backgroundColor: checked ? 'var(--sidebar-accent)' : 'transparent',
            }}
          >
            {checked && <CheckSquare size={12} color="white" />}
          </button>
          <span className="text-sm" style={{ color: 'var(--foreground)' }}>{field.placeholder ?? 'Enabled'}</span>
        </div>
      ) : field.type === 'dataTable' ? (
        <DataTableRenderer />
      ) : null}
    </div>
  );
}'''

content = content.replace(old_field_renderer, new_field_renderer)

# 3. Add Desktop to DeviceFrame - replace the DeviceFrame function
old_device_frame = '''function DeviceFrame({ device, children }: { device: 'phone' | 'tablet'; children: React.ReactNode }) {'''

new_device_frame = '''function DeviceFrame({ device, children }: { device: 'phone' | 'tablet' | 'desktop'; children: React.ReactNode }) {'''

content = content.replace(old_device_frame, new_device_frame)

# Add desktop frame rendering before the tablet return
old_tablet_comment = '''  // Tablet
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
}'''

new_tablet_and_desktop = '''  // Tablet
  if (device === 'tablet') {
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

  // Desktop
  return (
    <div
      className="relative rounded-xl border-[3px] shadow-2xl"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--border)',
        width: 960,
        minHeight: 600,
      }}
    >
      {/* Monitor top bezel */}
      <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ backgroundColor: 'var(--border)' }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
        <span className="flex-1 text-center text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Desktop Preview</span>
      </div>
      {/* Screen */}
      <div className="overflow-y-auto" style={{ backgroundColor: 'var(--card)', minHeight: 560 }}>
        {children}
      </div>
      {/* Stand */}
      <div className="flex justify-center">
        <div style={{ width: 120, height: 20, backgroundColor: 'var(--border)', clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' }} />
      </div>
      <div className="flex justify-center -mt-px">
        <div className="rounded-b-lg" style={{ width: 200, height: 6, backgroundColor: 'var(--border)' }} />
      </div>
    </div>
  );
}'''

content = content.replace(old_tablet_comment, new_tablet_and_desktop)

# 4. Add Desktop button to preview device toggle
old_device_toggle_end = '''              <button
                onClick={() => setPreviewDevice('tablet')}
                className={cn('flex items-center gap-1 px-3 py-1.5 text-xs transition-colors')}
                style={{
                  backgroundColor: previewDevice === 'tablet' ? 'var(--sidebar-accent)' : 'transparent',
                  color: previewDevice === 'tablet' ? 'var(--primary-foreground)' : 'var(--foreground)',
                }}
              >
                <Tablet size={13} /> Tablet
              </button>
            </div>'''

new_device_toggle_end = '''              <button
                onClick={() => setPreviewDevice('tablet')}
                className={cn('flex items-center gap-1 px-3 py-1.5 text-xs transition-colors')}
                style={{
                  backgroundColor: previewDevice === 'tablet' ? 'var(--sidebar-accent)' : 'transparent',
                  color: previewDevice === 'tablet' ? 'var(--primary-foreground)' : 'var(--foreground)',
                }}
              >
                <Tablet size={13} /> Tablet
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={cn('flex items-center gap-1 px-3 py-1.5 text-xs transition-colors')}
                style={{
                  backgroundColor: previewDevice === 'desktop' ? 'var(--sidebar-accent)' : 'transparent',
                  color: previewDevice === 'desktop' ? 'var(--primary-foreground)' : 'var(--foreground)',
                }}
              >
                <Monitor size={13} /> Desktop
              </button>
            </div>'''

content = content.replace(old_device_toggle_end, new_device_toggle_end)

with open(filepath, 'w') as f:
    f.write(content)

print("power-apps-client.tsx modified successfully")
