'use client';

import React, { useEffect, useCallback } from 'react';
import { usePresentationStore } from '@/store/presentation-store';

export default function PresenterMode() {
  const {
    slides,
    activeSlideIndex,
    presenterMode,
    setPresenterMode,
    setActiveSlide,
  } = usePresentationStore();

  const slide = slides[activeSlideIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPresenterMode(false);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (activeSlideIndex < slides.length - 1) {
          setActiveSlide(activeSlideIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeSlideIndex > 0) {
          setActiveSlide(activeSlideIndex - 1);
        }
      }
    },
    [activeSlideIndex, slides.length, setPresenterMode, setActiveSlide],
  );

  useEffect(() => {
    if (!presenterMode) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presenterMode, handleKeyDown]);

  if (!presenterMode || !slide) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: '#000' }}
    >
      <div
        className="relative"
        style={{
          width: '100vw',
          height: '100vh',
          background: slide.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Scale content to fit viewport */}
        <div
          className="relative"
          style={{
            width: 960,
            height: 540,
            transform: `scale(${Math.min(
              window.innerWidth / 960,
              window.innerHeight / 540,
            )})`,
            transformOrigin: 'center center',
          }}
        >
          {slide.elements.map((el) => {
            if (el.type === 'image') {
              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={el.content}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }
            if (el.type === 'shape') {
              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
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
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  minHeight: el.height,
                  fontSize: el.style.fontSize,
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
        </div>
      </div>

      {/* Slide counter overlay */}
      <div
        className="absolute bottom-4 right-6 text-white/70 font-mono text-lg"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
      >
        {activeSlideIndex + 1} / {slides.length}
      </div>

      {/* Exit hint */}
      <div className="absolute top-4 right-6 text-white/40 text-xs">
        ESC to exit
      </div>
    </div>
  );
}
