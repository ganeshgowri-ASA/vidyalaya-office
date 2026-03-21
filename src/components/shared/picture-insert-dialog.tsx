'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  X, Upload, Link as LinkIcon, Image as ImageIcon, Grid3X3,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { STOCK_PHOTOS } from './picture-formatting-constants';
import { makeSvgPlaceholder } from './picture-formatting-utils';

interface Props {
  onClose: () => void;
  onInsert: (src: string, altText?: string) => void;
}

type Tab = 'upload' | 'url' | 'stock' | 'gallery';

export function InsertImageDialog({ onClose, onInsert }: Props) {
  const [tab, setTab] = useState<Tab>('upload');
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onInsert(e.target.result as string, altText || file.name);
      }
    };
    reader.readAsDataURL(file);
  }, [altText, onInsert]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), altText);
    }
  };

  const handleStockInsert = (photo: typeof STOCK_PHOTOS[0]) => {
    const src = makeSvgPlaceholder(photo.name, photo.color);
    onInsert(src, photo.name);
  };

  const tabStyle = (t: Tab) =>
    cn(
      'px-3 py-1.5 text-xs rounded-t transition-colors',
      tab === t
        ? 'font-medium'
        : 'opacity-60 hover:opacity-90'
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-[520px] rounded-xl border shadow-2xl flex flex-col"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Insert Image
          </h2>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 px-4 pt-2 border-b"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          {(['upload', 'url', 'stock'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tabStyle(t)}
              style={
                tab === t
                  ? { borderBottom: '2px solid var(--primary)', color: 'var(--primary)' }
                  : {}
              }
            >
              {t === 'upload' ? 'Upload' : t === 'url' ? 'From URL' : 'Stock Photos'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors',
                  dragging ? 'border-blue-500 bg-blue-500/10' : 'hover:border-blue-400'
                )}
                style={{ borderColor: dragging ? '#3b82f6' : 'var(--border)' }}
              >
                <Upload size={32} className="mb-3 opacity-50" style={{ color: 'var(--foreground)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Drop an image here or click to browse
                </p>
                <p className="text-xs mt-1 opacity-50" style={{ color: 'var(--muted-foreground)' }}>
                  PNG, JPG, GIF, WebP, SVG supported
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full text-sm px-3 py-2 rounded border"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlInsert()}
                />
              </div>
              {url && (
                <div
                  className="rounded-lg overflow-hidden border flex items-center justify-center"
                  style={{ borderColor: 'var(--border)', minHeight: 120 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="preview"
                    className="max-h-48 max-w-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          )}

          {tab === 'stock' && (
            <div>
              <p className="text-xs mb-3 opacity-60" style={{ color: 'var(--muted-foreground)' }}>
                Click a photo to insert a placeholder
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STOCK_PHOTOS.map((photo) => (
                  <button
                    key={photo.name}
                    onClick={() => handleStockInsert(photo)}
                    className="rounded-lg overflow-hidden border hover:ring-2 hover:ring-blue-500 transition-all text-left"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div
                      className="h-20 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: photo.color + '33' }}
                    >
                      {photo.emoji}
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                        {photo.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alt text - shown on upload and url tabs */}
          {(tab === 'upload' || tab === 'url') && (
            <div className="mt-3">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Alt text (accessibility)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for screen readers"
                className="w-full text-sm px-3 py-2 rounded border"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded border hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Cancel
          </button>
          {tab === 'url' && (
            <button
              onClick={handleUrlInsert}
              disabled={!url.trim()}
              className="px-4 py-1.5 text-sm rounded flex items-center gap-1.5 disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Insert <ChevronRight size={14} />
            </button>
          )}
          {tab === 'upload' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 text-sm rounded flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <ImageIcon size={14} /> Choose File
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
