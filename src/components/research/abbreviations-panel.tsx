'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { Plus, X, BookA } from 'lucide-react';

export default function AbbreviationsPanel() {
  const { abbreviations, addAbbreviation, removeAbbreviation } = useResearchStore();
  const [newAbbr, setNewAbbr] = useState('');
  const [newFull, setNewFull] = useState('');

  const handleAdd = () => {
    if (newAbbr.trim() && newFull.trim()) {
      addAbbreviation(newAbbr.trim(), newFull.trim());
      setNewAbbr('');
      setNewFull('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookA size={14} style={{ color: 'var(--primary)' }} />
        <h4 className="text-xs font-semibold">List of Abbreviations</h4>
      </div>

      {/* Add form */}
      <div className="flex gap-1">
        <input
          type="text"
          value={newAbbr}
          onChange={(e) => setNewAbbr(e.target.value)}
          placeholder="Abbr."
          className="w-16 text-xs px-2 py-1 rounded border"
          style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
        />
        <input
          type="text"
          value={newFull}
          onChange={(e) => setNewFull(e.target.value)}
          placeholder="Full form..."
          className="flex-1 text-xs px-2 py-1 rounded border"
          style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button
          onClick={handleAdd}
          className="text-xs px-2 py-1 rounded"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--sidebar-accent)' }}>
              <th className="text-left px-2 py-1.5 font-semibold border-b" style={{ borderColor: 'var(--border)' }}>Abbreviation</th>
              <th className="text-left px-2 py-1.5 font-semibold border-b" style={{ borderColor: 'var(--border)' }}>Full Form</th>
              <th className="w-6 border-b" style={{ borderColor: 'var(--border)' }}></th>
            </tr>
          </thead>
          <tbody>
            {abbreviations.sort((a, b) => a.abbr.localeCompare(b.abbr)).map((a) => (
              <tr key={a.abbr} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <td className="px-2 py-1 font-mono font-medium" style={{ color: 'var(--primary)' }}>{a.abbr}</td>
                <td className="px-2 py-1 opacity-70">{a.fullForm}</td>
                <td className="px-1">
                  <button onClick={() => removeAbbreviation(a.abbr)} className="opacity-30 hover:opacity-80 hover:text-red-400">
                    <X size={10} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {abbreviations.length === 0 && (
        <p className="text-[10px] opacity-40 text-center py-2">No abbreviations added yet</p>
      )}
    </div>
  );
}
