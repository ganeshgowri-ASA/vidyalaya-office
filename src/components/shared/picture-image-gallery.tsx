'use client';

import React from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import { usePictureStore } from '@/store/picture-store';

interface Props {
  onClose: () => void;
  onSelectImage: (src: string) => void;
}

export function ImageGallery({ onClose, onSelectImage }: Props) {
  const { gallery, removeFromGallery } = usePictureStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-[640px] rounded-xl border shadow-2xl flex flex-col"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Image Gallery
          </h2>
          <button onClick={onClose} className="opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
              <ImageIcon size={40} className="mb-3" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                No images in gallery yet.
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Images you insert will appear here for reuse.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-lg border overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.name}
                    className="w-full h-24 object-cover"
                    onClick={() => { onSelectImage(img.src); onClose(); }}
                  />
                  <div className="px-2 py-1">
                    <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {img.name}
                    </p>
                    {img.size && (
                      <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                        {Math.round(img.size / 1024)} KB
                      </p>
                    )}
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromGallery(img.id); }}
                    className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-xs opacity-50" style={{ color: 'var(--muted-foreground)' }}>
            {gallery.length} image{gallery.length !== 1 ? 's' : ''} in gallery
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded border hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
