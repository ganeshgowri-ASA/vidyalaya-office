'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { X, Plus, Trash2, Image, Table as TableIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'figures' | 'tables';

function FigureItem({ figure, onDelete }: { figure: { id: string; number: number; caption: string }; onDelete: () => void }) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
    >
      <div
        className="h-32 rounded mb-2 flex items-center justify-center"
        style={{ backgroundColor: 'var(--card)', border: '2px dashed var(--border)' }}
      >
        <div className="text-center opacity-30">
          <Image size={24} className="mx-auto mb-1" />
          <p className="text-xs">Figure placeholder</p>
          <p className="text-[10px]">Click to upload</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-xs font-medium opacity-60 shrink-0">Fig. {figure.number}.</span>
        <p className="text-xs leading-tight flex-1">{figure.caption}</p>
        <button onClick={onDelete} className="opacity-40 hover:text-red-400 shrink-0">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function TableItem({ table, onDelete }: { table: { id: string; number: number; caption: string; headers: string[]; rows: string[][] }; onDelete: () => void }) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">Table {table.number}</span>
        <button onClick={onDelete} className="opacity-40 hover:text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
      <p className="text-xs opacity-60 mb-2 italic">{table.caption}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  className="px-2 py-1 text-left border font-medium"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-2 py-1 border"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FigureTableManager() {
  const { figures, tables, addFigure, addTable, setShowFigureManager } = useResearchStore();
  const [tab, setTab] = useState<Tab>('figures');
  const [figureCaption, setFigureCaption] = useState('');
  const [tableCaption, setTableCaption] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(4);
  const [showAddFigure, setShowAddFigure] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [localFigures, setLocalFigures] = useState(figures);
  const [localTables, setLocalTables] = useState(tables);

  const handleAddFigure = () => {
    if (!figureCaption.trim()) return;
    addFigure(figureCaption.trim());
    setLocalFigures([...localFigures, { id: `f${Date.now()}`, number: localFigures.length + 1, caption: figureCaption.trim() }]);
    setFigureCaption('');
    setShowAddFigure(false);
  };

  const handleAddTable = () => {
    if (!tableCaption.trim()) return;
    const headers = Array.from({ length: tableCols }, (_, i) => `Column ${i + 1}`);
    const rows = Array.from({ length: tableRows }, () => Array.from({ length: tableCols }, () => ''));
    addTable(tableCaption.trim(), headers, rows);
    setLocalTables([...localTables, { id: `t${Date.now()}`, number: localTables.length + 1, caption: tableCaption.trim(), headers, rows }]);
    setTableCaption('');
    setShowAddTable(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={() => setShowFigureManager(false)}
    >
      <div
        className="w-full max-w-3xl flex flex-col rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-bold">Figures & Tables</h2>
          <button onClick={() => setShowFigureManager(false)}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4" style={{ borderColor: 'var(--border)' }}>
          {([['figures', 'Figures', Image], ['tables', 'Tables', TableIcon]] as const).map(([t, label, Icon]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors',
                tab === t ? 'font-medium' : 'opacity-50 border-transparent hover:opacity-80'
              )}
              style={tab === t ? { borderColor: 'var(--primary)', color: 'var(--foreground)' } : undefined}
            >
              <Icon size={14} /> {label} ({t === 'figures' ? localFigures.length : localTables.length})
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'figures' && (
            <div className="space-y-3">
              {!showAddFigure ? (
                <button
                  onClick={() => setShowAddFigure(true)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded border w-full justify-center"
                  style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}
                >
                  <Plus size={14} /> Add Figure
                </button>
              ) : (
                <div className="p-3 rounded border space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  <textarea
                    value={figureCaption}
                    onChange={(e) => setFigureCaption(e.target.value)}
                    placeholder="Figure caption..."
                    rows={2}
                    className="w-full text-xs px-2 py-1.5 rounded border resize-none"
                    style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddFigure} className="text-xs px-3 py-1 rounded" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>Add</button>
                    <button onClick={() => setShowAddFigure(false)} className="text-xs px-3 py-1 rounded opacity-60">Cancel</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {localFigures.map((fig) => (
                  <FigureItem
                    key={fig.id}
                    figure={fig}
                    onDelete={() => setLocalFigures(localFigures.filter((f) => f.id !== fig.id))}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === 'tables' && (
            <div className="space-y-3">
              {!showAddTable ? (
                <button
                  onClick={() => setShowAddTable(true)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded border w-full justify-center"
                  style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}
                >
                  <Plus size={14} /> Add Table
                </button>
              ) : (
                <div className="p-3 rounded border space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  <input
                    type="text"
                    value={tableCaption}
                    onChange={(e) => setTableCaption(e.target.value)}
                    placeholder="Table caption..."
                    className="w-full text-xs px-2 py-1.5 rounded border"
                    style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                  />
                  <div className="flex gap-3">
                    <label className="text-xs opacity-60 flex items-center gap-2">
                      Rows:
                      <input type="number" value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value) || 1)} min={1} max={20}
                        className="w-14 text-xs px-2 py-1 rounded border"
                        style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                      />
                    </label>
                    <label className="text-xs opacity-60 flex items-center gap-2">
                      Cols:
                      <input type="number" value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value) || 1)} min={1} max={12}
                        className="w-14 text-xs px-2 py-1 rounded border"
                        style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddTable} className="text-xs px-3 py-1 rounded" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>Add</button>
                    <button onClick={() => setShowAddTable(false)} className="text-xs px-3 py-1 rounded opacity-60">Cancel</button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {localTables.map((tbl) => (
                  <TableItem
                    key={tbl.id}
                    table={tbl}
                    onDelete={() => setLocalTables(localTables.filter((t) => t.id !== tbl.id))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setShowFigureManager(false)}
            className="px-4 py-1.5 rounded text-sm"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
