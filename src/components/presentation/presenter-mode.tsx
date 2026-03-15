'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { usePresentationStore } from '@/store/presentation-store';

export default function PresenterMode() {
  const {
    slides, activeSlideIndex, presenterMode,
    setPresenterMode, setActiveSlide,
  } = usePresentationStore();

  const slide = slides[activeSlideIndex];
  const [transitioning, setTransitioning] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<React.CSSProperties>({});
  const prevSlideIndex = useRef(activeSlideIndex);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [showLaser, setShowLaser] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Auto-advance timer
  useEffect(() => {
    if (!presenterMode || !slide?.transitionTiming?.autoAdvance) return;
    const seconds = slide.transitionTiming.autoAdvanceSeconds ?? 5;
    const timer = setTimeout(() => {
      if (activeSlideIndex < slides.length - 1) {
        setActiveSlide(activeSlideIndex + 1);
      } else if (slide.transitionTiming?.loop) {
        setActiveSlide(0);
      }
    }, seconds * 1000);
    return () => clearTimeout(timer);
  }, [presenterMode, activeSlideIndex, slide, slides.length, setActiveSlide]);

  useEffect(() => {
    if (prevSlideIndex.current !== activeSlideIndex && presenterMode) {
      const transitionType = slide?.transition || 'none';
      if (transitionType !== 'none') {
        setTransitioning(true);
        const initial: React.CSSProperties = { transition: 'none' };
        if (transitionType === 'fade' || transitionType === 'dissolve') {
          initial.opacity = 0;
        } else if (transitionType === 'slide' || transitionType === 'push') {
          initial.transform = 'translateX(100%)'; initial.opacity = 1;
        } else if (transitionType === 'zoom') {
          initial.transform = 'scale(0.5)'; initial.opacity = 0;
        } else if (transitionType === 'wipe') {
          initial.clipPath = 'inset(0 100% 0 0)';
        } else if (transitionType === 'split') {
          initial.clipPath = 'inset(50% 50% 50% 50%)';
        } else if (transitionType === 'cover') {
          initial.transform = 'translateY(100%)'; initial.opacity = 1;
        }
        setTransitionStyle(initial);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const final: React.CSSProperties = {
              transition: 'all 600ms ease-in-out',
              opacity: 1,
              transform: 'translateX(0) translateY(0) scale(1)',
              clipPath: 'inset(0 0 0 0)',
            };
            setTransitionStyle(final);
            setTimeout(() => setTransitioning(false), 600);
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
      } else if (e.key === 'l' || e.key === 'L') {
        setShowLaser(!showLaser);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes(!showNotes);
      } else if (e.key === 'Home') {
        setActiveSlide(0);
      } else if (e.key === 'End') {
        setActiveSlide(slides.length - 1);
      }
    },
    [activeSlideIndex, slides.length, setPresenterMode, setActiveSlide, showLaser, showNotes],
  );

  useEffect(() => {
    if (!presenterMode) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presenterMode, handleKeyDown]);

  // Laser pointer tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (showLaser) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  }, [showLaser]);

  if (!presenterMode || !slide) return null;

  const renderElement = (el: typeof slide.elements[0]) => {
    if (el.type === 'image') {
      return (
        <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={el.content} alt="" className="w-full h-full object-contain" />
        </div>
      );
    }

    if (el.type === 'table' && el.tableData) {
      const td = el.tableData;
      return (
        <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
          <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontSize: el.style.fontSize || 12, color: el.style.color || '#000' }}>
            <tbody>
              {td.cells.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{
                      border: '1px solid rgba(0,0,0,0.2)', padding: '2px 4px',
                      background: ri === 0 && td.headerRow ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                      fontWeight: ri === 0 && td.headerRow ? 'bold' : 'normal',
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (el.type === 'chart' && el.chartData) {
      // Simplified chart rendering for presenter mode
      const cd = el.chartData;
      const maxVal = Math.max(...cd.datasets.flatMap(d => d.data), 1);
      const padding = 40;
      const chartW = el.width - padding * 2;
      const chartH = el.height - padding * 2 - 20;
      const barGroupW = chartW / cd.labels.length;
      const barW = barGroupW / (cd.datasets.length + 1);

      if (cd.chartType === 'pie' || cd.chartType === 'doughnut') {
        const total = cd.datasets[0]?.data.reduce((a, b) => a + b, 0) || 1;
        let cumAngle = -Math.PI / 2;
        const cx = el.width / 2;
        const cy = el.height / 2;
        const r = Math.min(cx, cy) - 30;
        const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
        return (
          <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height, background: el.style.backgroundColor, borderRadius: 4 }}>
            <svg width={el.width} height={el.height}>
              {cd.datasets[0]?.data.map((val, i) => {
                const angle = (val / total) * Math.PI * 2;
                const x1 = cx + r * Math.cos(cumAngle);
                const y1 = cy + r * Math.sin(cumAngle);
                const x2 = cx + r * Math.cos(cumAngle + angle);
                const y2 = cy + r * Math.sin(cumAngle + angle);
                const largeArc = angle > Math.PI ? 1 : 0;
                const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                cumAngle += angle;
                return <path key={i} d={path} fill={colors[i % colors.length]} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />;
              })}
            </svg>
          </div>
        );
      }

      return (
        <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height, background: el.style.backgroundColor, borderRadius: 4 }}>
          <svg width={el.width} height={el.height}>
            <line x1={padding} y1={padding} x2={padding} y2={padding + chartH} stroke="rgba(255,255,255,0.3)" />
            <line x1={padding} y1={padding + chartH} x2={padding + chartW} y2={padding + chartH} stroke="rgba(255,255,255,0.3)" />
            {cd.chartType === 'line' ? (
              cd.datasets.map((ds, di) => {
                const points = ds.data.map((v, i) => ({
                  x: padding + barGroupW * i + barGroupW / 2,
                  y: padding + chartH - (v / maxVal) * chartH,
                }));
                return (
                  <g key={di}>
                    <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={ds.color} strokeWidth={2} />
                    {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={ds.color} />)}
                  </g>
                );
              })
            ) : (
              cd.datasets.map((ds, di) =>
                ds.data.map((v, i) => {
                  const barH = (v / maxVal) * chartH;
                  const x = padding + barGroupW * i + barW * (di + 0.5);
                  return <rect key={`${di}-${i}`} x={x} y={padding + chartH - barH} width={barW * 0.8} height={barH} fill={ds.color} rx={2} opacity={0.85} />;
                })
              )
            )}
          </svg>
        </div>
      );
    }

    if (el.type === 'shape') {
      const shapeColor = el.style.backgroundColor || '#3b82f6';
      let shapeStyle: React.CSSProperties = {
        left: el.x, top: el.y, width: el.width, height: el.height,
        backgroundColor: shapeColor, borderRadius: el.style.borderRadius || '0',
        boxShadow: el.style.shadow ? '4px 4px 12px rgba(0,0,0,0.4)' : 'none',
      };

      if (el.content === 'arrow') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(0 25%, 65% 25%, 65% 0, 100% 50%, 65% 100%, 65% 75%, 0 75%)', background: shapeColor };
      } else if (el.content === 'star') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', background: shapeColor };
      } else if (el.content === 'diamond') {
        shapeStyle = { ...shapeStyle, transform: 'rotate(45deg)', borderRadius: '0' };
      } else if (el.content === 'triangle') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: shapeColor };
      } else if (el.content === 'hexagon') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', background: shapeColor };
      } else if (el.content === 'pentagon') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', background: shapeColor };
      } else if (el.content === 'line') {
        shapeStyle = { ...shapeStyle, height: 3, backgroundColor: shapeColor };
      } else if (el.content === 'callout') {
        return (
          <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
            <div style={{ width: '100%', height: 'calc(100% - 10px)', backgroundColor: shapeColor, borderRadius: 8 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 20, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `10px solid ${shapeColor}` }} />
          </div>
        );
      }

      return <div key={el.id} className="absolute" style={shapeStyle} />;
    }

    // Text
    return (
      <div key={el.id} className="absolute" style={{
        left: el.x, top: el.y, width: el.width, minHeight: el.height,
        fontSize: el.style.fontSize, fontWeight: el.style.fontWeight,
        fontStyle: el.style.fontStyle, fontFamily: el.style.fontFamily || 'Arial',
        textDecoration: el.style.textDecoration || 'none',
        textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) || 'left',
        color: el.style.color, wordBreak: 'break-word',
      }}>
        {el.content}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: '#000', cursor: showLaser ? 'none' : 'default' }}
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        // Click to advance
        if (e.target === e.currentTarget || !showLaser) {
          if (activeSlideIndex < slides.length - 1) {
            setActiveSlide(activeSlideIndex + 1);
          }
        }
      }}
    >
      <div className="relative" style={{
        width: '100vw', height: '100vh',
        background: slide.background,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...transitionStyle,
      }}>
        <div className="relative" style={{
          width: 960, height: 540,
          transform: `scale(${Math.min(
            (typeof window !== 'undefined' ? window.innerWidth : 960) / 960,
            (typeof window !== 'undefined' ? window.innerHeight : 540) / 540,
          )})`,
          transformOrigin: 'center center',
        }}>
          {slide.elements.map(renderElement)}
        </div>
      </div>

      {/* Laser pointer */}
      {showLaser && laserPos && (
        <div className="fixed pointer-events-none z-[10000]" style={{
          left: laserPos.x - 6, top: laserPos.y - 6,
          width: 12, height: 12, borderRadius: '50%',
          background: 'radial-gradient(circle, #ff0000 0%, rgba(255,0,0,0.6) 40%, transparent 70%)',
          boxShadow: '0 0 8px 4px rgba(255,0,0,0.3)',
        }} />
      )}

      {/* Slide counter */}
      <div className="absolute bottom-4 right-6 text-white/70 font-mono text-lg"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
        {activeSlideIndex + 1} / {slides.length}
      </div>

      {/* Speaker notes panel */}
      {showNotes && slide.notes && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 max-h-32 overflow-y-auto"
          style={{ fontSize: 14, lineHeight: 1.5 }}>
          <div className="text-xs text-white/50 mb-1">Speaker Notes</div>
          {slide.notes}
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute top-4 right-6 text-white/30 text-xs text-right">
        <div>ESC to exit</div>
        <div>L: Laser pointer</div>
        <div>N: Speaker notes</div>
        <div>Home/End: First/Last</div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
        {slides.filter(s => !s.hidden).map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }}
            className="rounded-full transition-all"
            style={{
              width: i === activeSlideIndex ? 10 : 6,
              height: i === activeSlideIndex ? 10 : 6,
              background: i === activeSlideIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
