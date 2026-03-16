'use client';

import React, { useState } from 'react';
import { X, Plus, Palette, Type, Edit3 } from 'lucide-react';
import {
  usePresentationStore,
  DEFAULT_SLIDE_MASTERS,
  type SlideMaster,
} from '@/store/presentation-store';

const FONT_OPTIONS = [
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Trebuchet MS',
  'Helvetica',
  'Impact',
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-24 shrink-0" style={{ color: 'var(--foreground)' }}>
        {label}
      </span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border cursor-pointer"
        style={{ borderColor: 'var(--border)' }}
      />
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {value}
      </span>
    </label>
  );
}

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-24 shrink-0" style={{ color: 'var(--foreground)' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded border px-2 py-1 text-sm"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--foreground)',
        }}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SlideMasterPanel() {
  const {
    showSlideMaster,
    setShowSlideMaster,
    slideMasters,
    activeSlideIndex,
    addSlideMaster,
    updateSlideMaster,
    applySlideMaster,
  } = usePresentationStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<SlideMaster>>({});

  if (!showSlideMaster) return null;

  const editingMaster = editingId
    ? slideMasters.find((m) => m.id === editingId)
    : null;

  const startEditing = (master: SlideMaster) => {
    setEditingId(master.id);
    setEditDraft({
      name: master.name,
      background: master.background,
      titleColor: master.titleColor,
      textColor: master.textColor,
      accentColor: master.accentColor,
      fontFamily: master.fontFamily,
      headingFont: master.headingFont,
    });
  };

  const saveEditing = () => {
    if (editingId && editDraft) {
      updateSlideMaster(editingId, editDraft);
    }
    setEditingId(null);
    setEditDraft({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const handleAddMaster = () => {
    const newMaster: Omit<SlideMaster, 'id'> = {
      name: 'New Master',
      background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
      titleColor: '#ffffff',
      textColor: '#cbd5e1',
      accentColor: '#3b82f6',
      fontFamily: 'Arial',
      headingFont: 'Arial',
    };
    addSlideMaster(newMaster);
  };

  const handleApply = (masterId: string) => {
    applySlideMaster(activeSlideIndex, masterId);
  };

  // Try to extract a flat color from background string for the color input
  const getBgColorValue = (bg: string): string => {
    if (bg.startsWith('#')) return bg;
    const match = bg.match(/#[0-9a-fA-F]{6}/);
    return match ? match[0] : '#334155';
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/50">
      <div
        className="rounded-lg shadow-2xl border w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Palette size={18} style={{ color: 'var(--foreground)' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--card-foreground)' }}
            >
              Slide Masters
            </h2>
          </div>
          <button
            onClick={() => setShowSlideMaster(false)}
            className="p-1 rounded hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {editingMaster && editingId ? (
            /* ── Edit Mode ───────────────────────────────── */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 size={16} style={{ color: 'var(--foreground)' }} />
                <span
                  className="font-semibold text-sm"
                  style={{ color: 'var(--foreground)' }}
                >
                  Editing: {editingMaster.name}
                </span>
              </div>

              {/* Name */}
              <label className="flex items-center gap-2 text-sm">
                <span
                  className="w-24 shrink-0"
                  style={{ color: 'var(--foreground)' }}
                >
                  Name
                </span>
                <input
                  type="text"
                  value={editDraft.name ?? editingMaster.name}
                  onChange={(e) =>
                    setEditDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  className="flex-1 rounded border px-2 py-1 text-sm"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </label>

              {/* Background */}
              <label className="flex items-center gap-2 text-sm">
                <span
                  className="w-24 shrink-0"
                  style={{ color: 'var(--foreground)' }}
                >
                  Background
                </span>
                <input
                  type="color"
                  value={getBgColorValue(
                    editDraft.background ?? editingMaster.background,
                  )}
                  onChange={(e) =>
                    setEditDraft((d) => ({
                      ...d,
                      background: `linear-gradient(135deg, ${e.target.value} 0%, ${e.target.value}cc 100%)`,
                    }))
                  }
                  className="w-8 h-8 rounded border cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                />
                <div
                  className="w-20 h-8 rounded border"
                  style={{
                    background:
                      editDraft.background ?? editingMaster.background,
                    borderColor: 'var(--border)',
                  }}
                />
              </label>

              {/* Colors */}
              <ColorField
                label="Title Color"
                value={editDraft.titleColor ?? editingMaster.titleColor}
                onChange={(v) =>
                  setEditDraft((d) => ({ ...d, titleColor: v }))
                }
              />
              <ColorField
                label="Text Color"
                value={editDraft.textColor ?? editingMaster.textColor}
                onChange={(v) =>
                  setEditDraft((d) => ({ ...d, textColor: v }))
                }
              />
              <ColorField
                label="Accent Color"
                value={editDraft.accentColor ?? editingMaster.accentColor}
                onChange={(v) =>
                  setEditDraft((d) => ({ ...d, accentColor: v }))
                }
              />

              {/* Fonts */}
              <FontSelect
                label="Body Font"
                value={editDraft.fontFamily ?? editingMaster.fontFamily}
                onChange={(v) =>
                  setEditDraft((d) => ({ ...d, fontFamily: v }))
                }
              />
              <FontSelect
                label="Heading Font"
                value={editDraft.headingFont ?? editingMaster.headingFont}
                onChange={(v) =>
                  setEditDraft((d) => ({ ...d, headingFont: v }))
                }
              />

              {/* Preview */}
              <div>
                <span
                  className="text-xs font-medium mb-1 block"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Preview
                </span>
                <div
                  className="rounded-lg border p-4"
                  style={{
                    background:
                      editDraft.background ?? editingMaster.background,
                    borderColor: 'var(--border)',
                    minHeight: 120,
                  }}
                >
                  <div
                    style={{
                      color: editDraft.titleColor ?? editingMaster.titleColor,
                      fontFamily:
                        editDraft.headingFont ?? editingMaster.headingFont,
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}
                  >
                    Heading Text
                  </div>
                  <div
                    className="mt-2"
                    style={{
                      color: editDraft.textColor ?? editingMaster.textColor,
                      fontFamily:
                        editDraft.fontFamily ?? editingMaster.fontFamily,
                      fontSize: 14,
                    }}
                  >
                    Body text preview with the selected font and color settings.
                  </div>
                  <div
                    className="mt-2 inline-block rounded px-2 py-0.5 text-xs font-semibold"
                    style={{
                      background:
                        editDraft.accentColor ?? editingMaster.accentColor,
                      color: '#ffffff',
                    }}
                  >
                    Accent
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1.5 rounded border text-sm hover:opacity-80"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditing}
                  className="px-3 py-1.5 rounded text-sm font-medium hover:opacity-90"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* ── List Mode ────────────────────────────────── */
            <>
              {slideMasters.map((master) => (
                <div
                  key={master.id}
                  className="border rounded-lg p-3 hover:opacity-95 transition-opacity"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    {/* Background swatch */}
                    <div
                      className="w-16 h-10 rounded border shrink-0"
                      style={{
                        background: master.background,
                        borderColor: 'var(--border)',
                      }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-semibold text-sm truncate"
                          style={{ color: 'var(--card-foreground)' }}
                        >
                          {master.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full border"
                            title="Title Color"
                            style={{
                              background: master.titleColor,
                              borderColor: 'var(--border)',
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border"
                            title="Text Color"
                            style={{
                              background: master.textColor,
                              borderColor: 'var(--border)',
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border"
                            title="Accent Color"
                            style={{
                              background: master.accentColor,
                              borderColor: 'var(--border)',
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Type
                          size={12}
                          style={{ color: 'var(--muted-foreground)' }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {master.headingFont} / {master.fontFamily}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditing(master)}
                        className="p-1.5 rounded hover:opacity-80"
                        style={{ color: 'var(--muted-foreground)' }}
                        title="Edit master"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleApply(master.id)}
                        className="px-2.5 py-1 rounded text-xs font-medium hover:opacity-90"
                        style={{
                          background: 'var(--primary)',
                          color: 'var(--primary-foreground)',
                        }}
                        title="Apply to current slide"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new master */}
              <button
                onClick={handleAddMaster}
                className="w-full border border-dashed rounded-lg p-3 flex items-center justify-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--muted-foreground)',
                }}
              >
                <Plus size={16} />
                Add New Master
              </button>
            </>
          )}
        </div>

        {/* Footer hint */}
        {!editingId && (
          <div
            className="px-4 py-2 border-t text-xs shrink-0"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--muted-foreground)',
            }}
          >
            Click <strong>Apply</strong> to set a master on the current slide,
            or <strong>Edit</strong> to customize colors and fonts.
          </div>
        )}
      </div>
    </div>
  );
}
