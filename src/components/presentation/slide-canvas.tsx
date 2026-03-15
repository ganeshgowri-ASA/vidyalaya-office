'use client';

import React, { useRef, useCallback } from 'react';
import { usePresentationStore } from '@/store/presentation-store';

export default function SlideCanvas() {
  const {
    slides,
    activeSlideIndex,
    selectedElementId,
    selectElement,
    updateElementContent,
  } = usePresentationStore();

  const slide = slides[activeSlideIndex];
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        selectElement(null);
      }
    },
    [selectElement],
  );

  if (!slide) return null;

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
      <div
        ref={canvasRef}
        className="relative shadow-2xl"
        onClick={handleCanvasClick}
        style={{
          width: 960,
          height: 540,
          maxWidth: '100%',
          background: slide.background,
          aspectRatio: '16/9',
          borderRadius: 8,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {slide.elements.map((el) => {
          const isSelected = el.id === selectedElementId;
          if (el.type === 'image') {
            return (
              <div
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectElement(el.id);
                }}
                className="absolute cursor-pointer"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  outline: isSelected ? '2px solid #3b82f6' : 'none',
                  outlineOffset: 2,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={el.content}
                  alt="Slide image"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            );
          }

          if (el.type === 'shape') {
            const shapeColor = el.style.backgroundColor || '#3b82f6';
            let shapeStyle: React.CSSProperties = {
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              backgroundColor: shapeColor,
              borderRadius: el.style.borderRadius || '0',
              outline: isSelected ? '2px solid #3b82f6' : 'none',
              outlineOffset: 2,
            };

            if (el.content === 'arrow') {
              shapeStyle = {
                ...shapeStyle,
                backgroundColor: 'transparent',
                clipPath: 'polygon(0 25%, 65% 25%, 65% 0, 100% 50%, 65% 100%, 65% 75%, 0 75%)',
                background: shapeColor,
              };
            } else if (el.content === 'star') {
              shapeStyle = {
                ...shapeStyle,
                backgroundColor: 'transparent',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                background: shapeColor,
              };
            } else if (el.content === 'diamond') {
              shapeStyle = {
                ...shapeStyle,
                transform: 'rotate(45deg)',
                borderRadius: '0',
              };
            } else if (el.content === 'callout') {
              // Callout is rendered with a child pointer
              return (
                <div
                  key={el.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectElement(el.id);
                  }}
                  className="absolute cursor-pointer"
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    outline: isSelected ? '2px solid #3b82f6' : 'none',
                    outlineOffset: 2,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: 'calc(100% - 10px)',
                      backgroundColor: shapeColor,
                      borderRadius: 8,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 20,
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: `10px solid ${shapeColor}`,
                    }}
                  />
                </div>
              );
            }

            return (
              <div
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectElement(el.id);
                }}
                className="absolute cursor-pointer"
                style={shapeStyle}
              />
            );
          }

          // Text element
          return (
            <div
              key={el.id}
              onClick={(e) => {
                e.stopPropagation();
                selectElement(el.id);
              }}
              className="absolute cursor-text"
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                minHeight: el.height,
                outline: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
                outlineOffset: 2,
              }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const text = e.currentTarget.textContent || '';
                  updateElementContent(activeSlideIndex, el.id, text);
                }}
                className="w-full h-full outline-none"
                style={{
                  fontSize: el.style.fontSize || 20,
                  fontWeight: el.style.fontWeight || 'normal',
                  fontStyle: el.style.fontStyle || 'normal',
                  color: el.style.color || '#ffffff',
                  wordBreak: 'break-word',
                }}
              >
                {el.content}
              </div>
            </div>
          );
        })}

        {/* Slide number */}
        <div
          className="absolute bottom-2 right-3 text-white/60 font-medium"
          style={{ fontSize: 12 }}
        >
          {activeSlideIndex + 1}
        </div>
      </div>
    </div>
  );
}
