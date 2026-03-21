'use client';
import React from 'react';

interface DrawingHistoryProps {
  thumbnails: string[];   // base64 data URLs (small)
  currentIndex: number;
  onJump: (index: number) => void;
}

export default function DrawingHistory({ thumbnails, currentIndex, onJump }: DrawingHistoryProps) {
  return (
    <div
      className="flex flex-col text-xs"
      style={{ background: 'var(--sidebar, #1e293b)', borderLeft: '1px solid var(--border, #334155)', width: 140 }}
    >
      <div className="px-3 py-2 border-b border-white/10">
        <span className="font-semibold text-white text-xs">History</span>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-1 p-2">
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={`flex flex-col items-center gap-1 rounded p-1 transition-colors w-full
              ${i === currentIndex ? 'bg-blue-600/30 ring-1 ring-blue-500' : 'hover:bg-white/5'}`}
          >
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb}
                alt={`Step ${i + 1}`}
                className="w-full rounded border border-white/10"
                style={{ maxHeight: 60, objectFit: 'contain', background: '#fff' }}
              />
            ) : (
              <div className="w-full h-12 rounded border border-white/10 bg-gray-900 flex items-center justify-center text-gray-600 text-xs">
                Empty
              </div>
            )}
            <span className={`text-xs ${i === currentIndex ? 'text-blue-300' : 'text-gray-500'}`}>
              {i === 0 ? 'Initial' : `Step ${i}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
