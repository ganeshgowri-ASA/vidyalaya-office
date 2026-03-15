'use client';

import React, { useRef, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

export default function SlideCanvas() {
  const {
    slides,
    activeSlideIndex,
    selectedElementId,
    selectElement,
    updateElementContent,
    canvasZoom,
    setCanvasZoom,
    showGrid,
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

  const scale = canvasZoom / 100;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Canvas area */}
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
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Grid overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                zIndex: 50,
              }}
            >
              {/* Center guides */}
              <div
                className="absolute left-1/2 top-0 bottom-0"
                style={{
                  width: 1,
                  background: 'rgba(59,130,246,0.3)',
                  transform: 'translateX(-0.5px)',
                }}
              />
              <div
                className="absolute top-1/2 left-0 right-0"
                style={{
                  height: 1,
                  background: 'rgba(59,130,246,0.3)',
                  transform: 'translateY(-0.5px)',
                }}
              />
            </div>
          )}

          {slide.elements.map((el) => {
            const isSelected = el.id === selectedElementId;

            // Build shape-specific transform/style
            const shapeTransform: string[] = [];
            if (el.style.rotateX) shapeTransform.push(`rotateX(${el.style.rotateX}deg)`);
            if (el.style.rotateY) shapeTransform.push(`rotateY(${el.style.rotateY}deg)`);
            const perspectiveStyle: React.CSSProperties =
              shapeTransform.length > 0
                ? { perspective: 600, transformStyle: 'preserve-3d' as const }
                : {};

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
              const borderStyle = el.style.borderWidth
                ? `${el.style.borderWidth}px solid ${el.style.borderColor || '#000'}`
                : 'none';
              const shadowStyle = el.style.shadow
                ? '4px 4px 12px rgba(0,0,0,0.4)'
                : 'none';

              let shapeStyle: React.CSSProperties = {
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                backgroundColor: shapeColor,
                borderRadius: el.style.borderRadius || '0',
                outline: isSelected ? '2px solid #3b82f6' : 'none',
                outlineOffset: 2,
                border: borderStyle,
                boxShadow: shadowStyle,
                transform: shapeTransform.length > 0 ? shapeTransform.join(' ') : undefined,
                ...perspectiveStyle,
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
                const existingTransform = shapeTransform.length > 0 ? shapeTransform.join(' ') + ' ' : '';
                shapeStyle = {
                  ...shapeStyle,
                  transform: `${existingTransform}rotate(45deg)`,
                  borderRadius: '0',
                };
              } else if (el.content === 'callout') {
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
                      boxShadow: shadowStyle,
                      transform: shapeTransform.length > 0 ? shapeTransform.join(' ') : undefined,
                      ...perspectiveStyle,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 'calc(100% - 10px)',
                        backgroundColor: shapeColor,
                        borderRadius: 8,
                        border: borderStyle,
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

      {/* Zoom slider bar */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 border-t"
        style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
      >
        <button
          onClick={() => setCanvasZoom(Math.max(25, canvasZoom - 10))}
          className="p-1 rounded hover:opacity-80"
          style={{ color: 'var(--foreground)' }}
          title="Zoom out"
        >
          <Minus size={14} />
        </button>
        <input
          type="range"
          min={25}
          max={200}
          step={5}
          value={canvasZoom}
          onChange={(e) => setCanvasZoom(parseInt(e.target.value))}
          className="w-32 h-1.5 rounded appearance-none cursor-pointer"
          style={{ accentColor: 'var(--primary)' }}
        />
        <button
          onClick={() => setCanvasZoom(Math.min(200, canvasZoom + 10))}
          className="p-1 rounded hover:opacity-80"
          style={{ color: 'var(--foreground)' }}
          title="Zoom in"
        >
          <Plus size={14} />
        </button>
        <span
          className="text-xs font-medium w-12 text-center"
          style={{ color: 'var(--foreground)' }}
        >
          {canvasZoom}%
        </span>
        <button
          onClick={() => setCanvasZoom(100)}
          className="text-xs px-2 py-0.5 rounded border hover:opacity-80"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        >
          Fit
        </button>
      </div>
    </div>
  );
}
