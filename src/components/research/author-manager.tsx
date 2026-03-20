'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Users, Plus, Trash2, ChevronUp, ChevronDown, Mail, Building2,
  GripVertical, Star, ExternalLink,
} from 'lucide-react';

export default function AuthorManager() {
  const { authors, addAuthor, removeAuthor, updateAuthor, reorderAuthors } = useResearchStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAffiliation, setNewAffiliation] = useState('');
  const [newOrcid, setNewOrcid] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addAuthor({
      name: newName.trim(),
      email: newEmail.trim(),
      affiliation: newAffiliation.trim(),
      orcid: newOrcid.trim() || undefined,
      corresponding: authors.length === 0,
    });
    setNewName('');
    setNewEmail('');
    setNewAffiliation('');
    setNewOrcid('');
    setShowAdd(false);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      reorderAuthors(dragIndex, index);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <div
      className="h-full overflow-y-auto p-3 space-y-3"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} style={{ color: 'var(--primary)' }} />
          <h3 className="text-sm font-semibold">Authors ({authors.length})</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border opacity-60 hover:opacity-100"
          style={{ borderColor: 'var(--border)' }}
        >
          <Plus size={10} /> Add
        </button>
      </div>

      {/* Add author form */}
      {showAdd && (
        <div
          className="rounded-lg p-3 border space-y-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name *"
            className="w-full text-xs px-2 py-1.5 rounded border bg-transparent outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            className="w-full text-xs px-2 py-1.5 rounded border bg-transparent outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <input
            value={newAffiliation}
            onChange={(e) => setNewAffiliation(e.target.value)}
            placeholder="Affiliation"
            className="w-full text-xs px-2 py-1.5 rounded border bg-transparent outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <input
            value={newOrcid}
            onChange={(e) => setNewOrcid(e.target.value)}
            placeholder="ORCID (e.g. 0000-0001-2345-6789)"
            className="w-full text-xs px-2 py-1.5 rounded border bg-transparent outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 text-xs px-3 py-1.5 rounded font-medium"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Add Author
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="text-xs px-3 py-1.5 rounded border opacity-60 hover:opacity-100"
              style={{ borderColor: 'var(--border)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Author list */}
      <div className="space-y-2">
        {authors.map((author, index) => (
          <div
            key={author.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'rounded-lg p-2.5 border transition-all',
              dragIndex === index ? 'opacity-50' : ''
            )}
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-start gap-2">
              {/* Drag handle & order */}
              <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0 cursor-grab">
                <GripVertical size={12} className="opacity-30" />
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  {index + 1}
                </span>
              </div>

              {/* Author info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold truncate">{author.name}</p>
                  {author.corresponding && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 font-medium shrink-0">
                      Corresponding
                    </span>
                  )}
                </div>
                {author.email && (
                  <p className="text-[10px] opacity-50 flex items-center gap-1 mt-0.5">
                    <Mail size={9} /> {author.email}
                  </p>
                )}
                {author.affiliation && (
                  <p className="text-[10px] opacity-50 flex items-center gap-1 mt-0.5">
                    <Building2 size={9} /> {author.affiliation}
                  </p>
                )}
                {author.orcid && (
                  <p className="text-[10px] opacity-50 flex items-center gap-1 mt-0.5">
                    <ExternalLink size={9} /> ORCID: {author.orcid}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => updateAuthor(author.id, { corresponding: !author.corresponding })}
                  title={author.corresponding ? 'Remove corresponding' : 'Set as corresponding'}
                  className={cn(
                    'p-1 rounded transition-colors',
                    author.corresponding ? 'text-yellow-400' : 'opacity-30 hover:opacity-60'
                  )}
                >
                  <Star size={11} fill={author.corresponding ? 'currentColor' : 'none'} />
                </button>
                {index > 0 && (
                  <button
                    onClick={() => reorderAuthors(index, index - 1)}
                    className="p-1 rounded opacity-30 hover:opacity-60"
                  >
                    <ChevronUp size={11} />
                  </button>
                )}
                {index < authors.length - 1 && (
                  <button
                    onClick={() => reorderAuthors(index, index + 1)}
                    className="p-1 rounded opacity-30 hover:opacity-60"
                  >
                    <ChevronDown size={11} />
                  </button>
                )}
                <button
                  onClick={() => removeAuthor(author.id)}
                  className="p-1 rounded text-red-400 opacity-40 hover:opacity-80"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {authors.length === 0 && (
        <div className="text-center py-8 text-xs opacity-40">
          <Users size={24} className="mx-auto mb-2 opacity-30" />
          No authors added yet
        </div>
      )}
    </div>
  );
}
