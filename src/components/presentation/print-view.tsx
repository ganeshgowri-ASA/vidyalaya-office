'use client';

import React from 'react';
import { usePresentationStore } from '@/store/presentation-store';

export default function PrintView() {
  const { slides } = usePresentationStore();

  return (
    <div className="hidden print:block">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className="relative"
          style={{
            width: '100%',
            aspectRatio: '16/9',
            background: slide.background,
            pageBreakAfter: index < slides.length - 1 ? 'always' : 'auto',
            overflow: 'hidden',
          }}
        >
          {slide.elements.map((el) => {
            if (el.type === 'table' || el.type === 'chart') {
              return (
                <div key={el.id} className="absolute"
                  style={{
                    left: `${(el.x / 960) * 100}%`, top: `${(el.y / 540) * 100}%`,
                    width: `${(el.width / 960) * 100}%`, height: `${(el.height / 540) * 100}%`,
                    fontSize: 10, color: el.style.color || '#000',
                  }}>
                  {el.type === 'table' && el.tableData ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
                      <tbody>
                        {el.tableData.cells.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ border: '1px solid #ccc', padding: '1px 2px', fontWeight: ri === 0 && el.tableData?.headerRow ? 'bold' : 'normal' }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ background: '#eee', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>Chart</div>
                  )}
                </div>
              );
            }
            if (el.type === 'image') {
              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${(el.x / 960) * 100}%`,
                    top: `${(el.y / 540) * 100}%`,
                    width: `${(el.width / 960) * 100}%`,
                    height: `${(el.height / 540) * 100}%`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={el.content} alt="" className="w-full h-full object-contain" />
                </div>
              );
            }
            if (el.type === 'shape') {
              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${(el.x / 960) * 100}%`,
                    top: `${(el.y / 540) * 100}%`,
                    width: `${(el.width / 960) * 100}%`,
                    height: `${(el.height / 540) * 100}%`,
                    backgroundColor: el.style.backgroundColor,
                    borderRadius: el.style.borderRadius,
                  }}
                />
              );
            }
            return (
              <div
                key={el.id}
                className="absolute"
                style={{
                  left: `${(el.x / 960) * 100}%`,
                  top: `${(el.y / 540) * 100}%`,
                  width: `${(el.width / 960) * 100}%`,
                  minHeight: `${(el.height / 540) * 100}%`,
                  fontSize: `${(el.style.fontSize || 20) * 0.7}px`,
                  fontWeight: el.style.fontWeight,
                  fontStyle: el.style.fontStyle,
                  color: el.style.color,
                  wordBreak: 'break-word',
                }}
              >
                {el.content}
              </div>
            );
          })}
          <div
            className="absolute bottom-1 right-2 text-xs"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
}
