'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useTemplateGalleryStore, TEMPLATE_CATEGORIES } from '@/store/template-gallery-store';

export function SaveTemplateModal() {
  const { showSaveModal, setShowSaveModal, saveCustomTemplate } = useTemplateGalleryStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('flowchart');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState('');

  if (!showSaveModal) return null;

  const selectedCat = TEMPLATE_CATEGORIES.find(c => c.id === category);

  const handleSave = () => {
    if (!name.trim()) return;
    saveCustomTemplate({
      name: name.trim(),
      category,
      subcategory: subcategory || selectedCat?.subcategories[0] || 'General',
      description: description.trim() || `Custom ${name} template`,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      thumbnail: name.substring(0, 2).toUpperCase(),
      shapes: [
        { type: 'rect', x: 200, y: 100, width: 140, height: 70, fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2, label: 'Start', opacity: 1, rotation: 0 },
        { type: 'rect', x: 200, y: 220, width: 140, height: 70, fill: '#10b981', stroke: '#059669', strokeWidth: 2, label: 'Process', opacity: 1, rotation: 0 },
        { type: 'rect', x: 200, y: 340, width: 140, height: 70, fill: '#ef4444', stroke: '#dc2626', strokeWidth: 2, label: 'End', opacity: 1, rotation: 0 },
      ],
    });
    setName('');
    setDescription('');
    setTags('');
    setShowSaveModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>
            Save as Template
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom Template"
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your template..."
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none resize-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
              >
                {TEMPLATE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {selectedCat && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Subcategory
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
                >
                  <option value="">Select subcategory</option>
                  {selectedCat.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="flowchart, process, custom"
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setShowSaveModal(false)}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium border"
              style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Save size={14} /> Save Template
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowSaveModal(false)}
          className="absolute top-3 right-3 rounded-full p-1.5"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
