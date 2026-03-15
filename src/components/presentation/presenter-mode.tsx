'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
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
  const [transitioning, setTransitioning] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<React.CSSProperties>({});
  const prevSlideIndex = useRef(activeSlideIndex);

  useEffect(() => {
    if (prevSlideIndex.current !== activeSlideIndex && presenterMode) {
      const transitionType = slide?.transition || 'none';
      if (transitionType !== 'none') {
        setTransitioning(true);
        // Set initial state
        const initial: React.CSSProperties = { transition: 'none' };
        if (transitionType === 'fade') {
          initial.opacity = 0;
        } else if (transitionType === 'slide') {
          initial.transform = 'translateX(100%)';
          initial.opacity = 1;
        } else if (transitionType === 'zoom') {
          initial.transform = 'scale(0.5)';
          initial.opacity = 0;
        }
        setTransitionStyle(initial);

        // Trigger transition on next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const final: React.CSSProperties = {
              transition: 'all 500ms ease-in-out',
              opacity: 1,
              transform: 'translateX(0) scale(1)',
            };
            setTransitionStyle(final);
            setTimeout(() => setTransitioning(false), 500);
          });
        });
      }
    }
    prevSlideIndex.current = activeSlideIndex;
  }, [activeSlideIndex, presenterMode, slide?.transition]);

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
          ...transitionStyle,
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
              const shapeColor = el.style.backgroundColor || '#3b82f6';
              let shapeStyle: React.CSSProperties = {
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                backgroundColor: shapeColor,
                borderRadius: el.style.borderRadius || '0',
              };

              if (el.content === 'arrow') {
                shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(0 25%, 65% 25%, 65% 0, 100% 50%, 65% 100%, 65% 75%, 0 75%)', background: shapeColor };
              } else if (el.content === 'star') {
                shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', background: shapeColor };
              } else if (el.content === 'diamond') {
                shapeStyle = { ...shapeStyle, transform: 'rotate(45deg)', borderRadius: '0' };
              } else if (el.content === 'callout') {
                return (
                  <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
                    <div style={{ width: '100%', height: 'calc(100% - 10px)', backgroundColor: shapeColor, borderRadius: 8 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 20, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `10px solid ${shapeColor}` }} />
                  </div>
                );
              }

              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={shapeStyle}
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
