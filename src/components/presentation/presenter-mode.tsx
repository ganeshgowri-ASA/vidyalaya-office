'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { usePresentationStore, type SlideTransitionType } from '@/store/presentation-store';
import { SHAPE_DEFINITIONS } from '@/components/shared/shapes-icons-library';

export default function PresenterMode() {
  const {
    slides, activeSlideIndex, presenterMode, presenterViewMode,
    setPresenterMode, setActiveSlide, setPresenterViewMode,
    addSlideShowAnnotation, clearSlideShowAnnotations, slideShowAnnotations,
  } = usePresentationStore();

  const slide = slides[activeSlideIndex];
  const [transitioning, setTransitioning] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<React.CSSProperties>({});
  const prevSlideIndex = useRef(activeSlideIndex);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [showLaser, setShowLaser] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<'none' | 'pen' | 'highlighter'>('none');
  const [annotationColor, setAnnotationColor] = useState('#ef4444');
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [annotations, setAnnotations] = useState<Array<{ points: Array<{ x: number; y: number }>; color: string; tool: 'pen' | 'highlighter' }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showPresenterPanel, setShowPresenterPanel] = useState(presenterViewMode);
  const startTimeRef = useRef<number>(Date.now());
  const slideRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (!presenterMode) return;
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [presenterMode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  // Transition effects
  useEffect(() => {
    if (prevSlideIndex.current !== activeSlideIndex && presenterMode) {
      let transitionType = slide?.transition || 'none';
      if (transitionType === 'random') {
        const types: SlideTransitionType[] = ['fade', 'slide', 'zoom', 'wipe', 'split', 'push', 'cover', 'dissolve', 'morph', 'reveal'];
        transitionType = types[Math.floor(Math.random() * types.length)];
      }
      const duration = slide?.transitionDuration ?? 0.6;

      if (transitionType !== 'none') {
        setTransitioning(true);
        const initial: React.CSSProperties = { transition: 'none' };

        switch (transitionType) {
          case 'fade': case 'dissolve': initial.opacity = 0; break;
          case 'slide': case 'push': initial.transform = 'translateX(100%)'; initial.opacity = 1; break;
          case 'zoom': initial.transform = 'scale(0.5)'; initial.opacity = 0; break;
          case 'wipe': initial.clipPath = 'inset(0 100% 0 0)'; break;
          case 'split': initial.clipPath = 'inset(50% 50% 50% 50%)'; break;
          case 'cover': initial.transform = 'translateY(100%)'; initial.opacity = 1; break;
          case 'morph': initial.transform = 'scale(1.1) rotate(2deg)'; initial.opacity = 0; break;
          case 'reveal': initial.clipPath = 'inset(0 0 100% 0)'; break;
          case 'cut': break;
          case 'uncover': initial.transform = 'translateY(-100%)'; initial.opacity = 1; break;
        }
        setTransitionStyle(initial);

        if (transitionType === 'cut') {
          setTransitioning(false);
        } else {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const final: React.CSSProperties = {
                transition: `all ${duration * 1000}ms ease-in-out`,
                opacity: 1,
                transform: 'translateX(0) translateY(0) scale(1) rotate(0deg)',
                clipPath: 'inset(0 0 0 0)',
              };
              setTransitionStyle(final);
              setTimeout(() => setTransitioning(false), duration * 1000);
            });
          });
        }
      }
      // Clear annotations on slide change
      setAnnotations([]);
    }
    prevSlideIndex.current = activeSlideIndex;
  }, [activeSlideIndex, presenterMode, slide?.transition, slide?.transitionDuration]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPresenterMode(false);
        setPresenterViewMode(false);
        clearSlideShowAnnotations();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (activeSlideIndex < slides.length - 1) setActiveSlide(activeSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeSlideIndex > 0) setActiveSlide(activeSlideIndex - 1);
      } else if (e.key === 'l' || e.key === 'L') {
        setShowLaser(!showLaser);
        setAnnotationTool('none');
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes(!showNotes);
      } else if (e.key === 'p' || e.key === 'P') {
        setAnnotationTool(annotationTool === 'pen' ? 'none' : 'pen');
        setShowLaser(false);
      } else if (e.key === 'h' || e.key === 'H') {
        setAnnotationTool(annotationTool === 'highlighter' ? 'none' : 'highlighter');
        setShowLaser(false);
      } else if (e.key === 'c' || e.key === 'C') {
        setAnnotations([]);
      } else if (e.key === 'Home') {
        setActiveSlide(0);
      } else if (e.key === 'End') {
        setActiveSlide(slides.length - 1);
      }
    },
    [activeSlideIndex, slides.length, setPresenterMode, setActiveSlide, showLaser, showNotes, annotationTool, setPresenterViewMode, clearSlideShowAnnotations],
  );

  useEffect(() => {
    if (!presenterMode) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presenterMode, handleKeyDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (showLaser) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
    if (isDrawing && annotationTool !== 'none' && slideRef.current) {
      const rect = slideRef.current.getBoundingClientRect();
      setCurrentPath(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  }, [showLaser, isDrawing, annotationTool]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (annotationTool !== 'none' && slideRef.current) {
      e.preventDefault();
      setIsDrawing(true);
      const rect = slideRef.current.getBoundingClientRect();
      setCurrentPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  }, [annotationTool]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentPath.length > 1) {
      setAnnotations(prev => [...prev, {
        points: currentPath,
        color: annotationTool === 'highlighter' ? `${annotationColor}66` : annotationColor,
        tool: annotationTool as 'pen' | 'highlighter',
      }]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, annotationColor, annotationTool]);

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

    if (el.type === 'media' && el.mediaData) {
      if (el.mediaData.mediaType === 'video') {
        return (
          <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
            <iframe src={el.mediaData.url} className="w-full h-full" allow="autoplay" style={{ border: 'none' }} />
          </div>
        );
      }
      if (el.mediaData.mediaType === 'audio') {
        return (
          <div key={el.id} className="absolute flex items-center justify-center" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
            <audio controls autoPlay={el.mediaData.autoplay} loop={el.mediaData.loop} src={el.mediaData.url} />
          </div>
        );
      }
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

      const advancedShape = SHAPE_DEFINITIONS.find(s => s.id === el.content);
      if (advancedShape) {
        return (
          <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
            <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
              <path d={advancedShape.svgPath} fill={shapeColor} fillOpacity={0.8} stroke={el.style.borderColor || shapeColor} strokeWidth={2} />
            </svg>
          </div>
        );
      }

      if (el.content === 'arrow') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(0 25%, 65% 25%, 65% 0, 100% 50%, 65% 100%, 65% 75%, 0 75%)', background: shapeColor };
      } else if (el.content === 'arrow-left') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(100% 25%, 35% 25%, 35% 0, 0 50%, 35% 100%, 35% 75%, 100% 75%)', background: shapeColor };
      } else if (el.content === 'arrow-up') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(25% 100%, 25% 35%, 0 35%, 50% 0, 100% 35%, 75% 35%, 75% 100%)', background: shapeColor };
      } else if (el.content === 'arrow-down') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(25% 0, 25% 65%, 0 65%, 50% 100%, 100% 65%, 75% 65%, 75% 0)', background: shapeColor };
      } else if (el.content === 'arrow-double') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(0 50%, 25% 0, 25% 25%, 75% 25%, 75% 0, 100% 50%, 75% 100%, 75% 75%, 25% 75%, 25% 100%)', background: shapeColor };
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
      } else if (el.content === 'heart') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 85%, 15% 55%, 0% 35%, 0% 20%, 10% 5%, 25% 0%, 40% 5%, 50% 20%, 60% 5%, 75% 0%, 90% 5%, 100% 20%, 100% 35%, 85% 55%)', background: shapeColor };
      } else if (el.content === 'cloud') {
        return (
          <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
            <svg viewBox="0 0 100 60" width={el.width} height={el.height}>
              <ellipse cx="35" cy="40" rx="25" ry="18" fill={shapeColor} />
              <ellipse cx="65" cy="40" rx="25" ry="18" fill={shapeColor} />
              <ellipse cx="50" cy="25" rx="30" ry="22" fill={shapeColor} />
              <ellipse cx="25" cy="30" rx="20" ry="15" fill={shapeColor} />
              <ellipse cx="75" cy="30" rx="20" ry="15" fill={shapeColor} />
            </svg>
          </div>
        );
      } else if (el.content === 'cross') {
        shapeStyle = { ...shapeStyle, backgroundColor: 'transparent', clipPath: 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)', background: shapeColor };
      } else if (el.content === 'line') {
        shapeStyle = { ...shapeStyle, height: 3, backgroundColor: shapeColor };
      } else if (el.content === 'callout' || el.content === 'callout-round') {
        return (
          <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
            <div style={{ width: '100%', height: 'calc(100% - 10px)', backgroundColor: shapeColor, borderRadius: el.content === 'callout-round' ? '50%' : 8 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 20, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `10px solid ${shapeColor}` }} />
          </div>
        );
      }

      return <div key={el.id} className="absolute" style={shapeStyle} />;
    }

    // Text with effects
    const textEffectStyle: React.CSSProperties = {};
    if (el.textEffect?.wordArt) {
      // Apply WordArt styles inline
      if (el.textEffect.wordArt.includes('gradient')) {
        textEffectStyle.background = 'linear-gradient(to right, #3b82f6, #06b6d4)';
        textEffectStyle.WebkitBackgroundClip = 'text';
        textEffectStyle.WebkitTextFillColor = 'transparent';
      }
      if (el.textEffect.wordArt.includes('glow')) {
        textEffectStyle.textShadow = '0 0 10px currentColor, 0 0 20px currentColor';
      }
    }
    if (el.textEffect?.textShadow) {
      textEffectStyle.textShadow = el.textEffect.textShadow;
    }
    if (el.textEffect?.gradientFill) {
      textEffectStyle.background = el.textEffect.gradientFill;
      textEffectStyle.WebkitBackgroundClip = 'text';
      textEffectStyle.WebkitTextFillColor = 'transparent';
    }

    return (
      <div key={el.id} className="absolute" style={{
        left: el.x, top: el.y, width: el.width, minHeight: el.height,
        fontSize: el.style.fontSize, fontWeight: el.style.fontWeight,
        fontStyle: el.style.fontStyle, fontFamily: el.style.fontFamily || 'Arial',
        textDecoration: el.style.textDecoration || 'none',
        textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) || 'left',
        color: el.style.color, wordBreak: 'break-word',
        ...textEffectStyle,
      }}>
        {el.content}
      </div>
    );
  };

  const currentCursor = annotationTool !== 'none' ? 'crosshair' : showLaser ? 'none' : 'default';

  // Presenter View Mode (split screen)
  if (showPresenterPanel) {
    return (
      <div className="fixed inset-0 z-[9999] flex" style={{ background: '#1a1a2e' }}>
        {/* Main slide area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4" style={{ cursor: currentCursor }}
            onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
            <div ref={slideRef} className="relative" style={{
              width: '100%', maxWidth: 800, aspectRatio: '16/9',
              background: slide.background, borderRadius: 4, overflow: 'hidden',
              ...transitionStyle,
            }}>
              <div className="relative w-full h-full" style={{ transform: 'scale(0.83)', transformOrigin: 'top left', width: 960, height: 540 }}>
                {slide.elements.map(renderElement)}
              </div>
              {/* Annotations SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 100 }}>
                {annotations.map((ann, i) => (
                  <polyline key={i} points={ann.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke={ann.color} strokeWidth={ann.tool === 'highlighter' ? 12 : 3}
                    strokeLinecap="round" strokeLinejoin="round" />
                ))}
                {currentPath.length > 1 && (
                  <polyline points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke={annotationTool === 'highlighter' ? `${annotationColor}66` : annotationColor}
                    strokeWidth={annotationTool === 'highlighter' ? 12 : 3}
                    strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2" style={{ background: '#0f0f23' }}>
            <span className="text-white/60 text-sm font-mono">{formatTime(elapsedTime)}</span>
            <span className="text-white/60 text-sm">{activeSlideIndex + 1} / {slides.length}</span>
            <span className="text-white/40 text-xs">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Presenter sidebar */}
        <div className="w-80 flex flex-col border-l" style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#0f0f23' }}>
          {/* Next slide preview */}
          <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="text-white/50 text-xs mb-1">Next Slide</div>
            {activeSlideIndex < slides.length - 1 ? (
              <div className="rounded overflow-hidden" style={{ aspectRatio: '16/9', background: slides[activeSlideIndex + 1].background }}>
                <div className="w-full h-full relative">
                  {slides[activeSlideIndex + 1].elements.slice(0, 2).map((el) => (
                    <div key={el.id} className="absolute overflow-hidden"
                      style={{ left: `${(el.x / 960) * 100}%`, top: `${(el.y / 540) * 100}%`, width: `${(el.width / 960) * 100}%`, fontSize: 6, color: el.style.color || '#fff' }}>
                      {el.type === 'text' ? el.content : ''}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded flex items-center justify-center text-white/30 text-xs" style={{ aspectRatio: '16/9', background: '#1a1a2e' }}>
                End of Presentation
              </div>
            )}
          </div>

          {/* Speaker notes */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="text-white/50 text-xs mb-2">Speaker Notes</div>
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
              {slide.notes || 'No notes for this slide.'}
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex gap-1 mb-2">
              <button onClick={() => { setAnnotationTool('pen'); setShowLaser(false); }}
                className="flex-1 text-xs py-1 rounded" style={{ background: annotationTool === 'pen' ? '#ef4444' : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                Pen
              </button>
              <button onClick={() => { setAnnotationTool('highlighter'); setShowLaser(false); }}
                className="flex-1 text-xs py-1 rounded" style={{ background: annotationTool === 'highlighter' ? '#f59e0b' : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                Highlight
              </button>
              <button onClick={() => { setShowLaser(!showLaser); setAnnotationTool('none'); }}
                className="flex-1 text-xs py-1 rounded" style={{ background: showLaser ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                Laser
              </button>
            </div>
            <button onClick={() => { setPresenterMode(false); setPresenterViewMode(false); }}
              className="w-full text-xs py-1.5 rounded text-white/70 hover:text-white" style={{ background: 'rgba(255,255,255,0.1)' }}>
              End Slide Show (ESC)
            </button>
          </div>
        </div>

        {/* Laser pointer */}
        {showLaser && laserPos && (
          <div className="fixed pointer-events-none z-[10000]" style={{
            left: laserPos.x - 6, top: laserPos.y - 6, width: 12, height: 12, borderRadius: '50%',
            background: 'radial-gradient(circle, #ff0000 0%, rgba(255,0,0,0.6) 40%, transparent 70%)',
            boxShadow: '0 0 8px 4px rgba(255,0,0,0.3)',
          }} />
        )}
      </div>
    );
  }

  // Standard Full-Screen Mode
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: '#000', cursor: currentCursor }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={(e) => {
        if (annotationTool !== 'none') return;
        if (e.target === e.currentTarget || !showLaser) {
          if (activeSlideIndex < slides.length - 1) setActiveSlide(activeSlideIndex + 1);
        }
      }}
    >
      <div ref={slideRef} className="relative" style={{
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

      {/* Annotations SVG overlay */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9999]">
        {annotations.map((ann, i) => (
          <polyline key={i} points={ann.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke={ann.color} strokeWidth={ann.tool === 'highlighter' ? 12 : 3}
            strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {currentPath.length > 1 && (
          <polyline points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke={annotationTool === 'highlighter' ? `${annotationColor}66` : annotationColor}
            strokeWidth={annotationTool === 'highlighter' ? 12 : 3}
            strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>

      {/* Laser pointer */}
      {showLaser && laserPos && (
        <div className="fixed pointer-events-none z-[10000]" style={{
          left: laserPos.x - 6, top: laserPos.y - 6, width: 12, height: 12, borderRadius: '50%',
          background: 'radial-gradient(circle, #ff0000 0%, rgba(255,0,0,0.6) 40%, transparent 70%)',
          boxShadow: '0 0 8px 4px rgba(255,0,0,0.3)',
        }} />
      )}

      {/* Slide counter */}
      <div className="absolute bottom-4 right-6 text-white/70 font-mono text-lg z-[9999]"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
        {activeSlideIndex + 1} / {slides.length}
      </div>

      {/* Timer */}
      <div className="absolute top-4 left-6 text-white/50 font-mono text-sm z-[9999]">
        {formatTime(elapsedTime)} | {new Date().toLocaleTimeString()}
      </div>

      {/* Speaker notes panel */}
      {showNotes && slide.notes && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 max-h-32 overflow-y-auto z-[9999]"
          style={{ fontSize: 14, lineHeight: 1.5 }}>
          <div className="text-xs text-white/50 mb-1">Speaker Notes</div>
          {slide.notes}
        </div>
      )}

      {/* Annotation tool indicator */}
      {annotationTool !== 'none' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs z-[9999]">
          {annotationTool === 'pen' ? 'Pen Mode (P to toggle, C to clear)' : 'Highlighter Mode (H to toggle, C to clear)'}
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute top-4 right-6 text-white/30 text-xs text-right z-[9999]">
        <div>ESC to exit</div>
        <div>L: Laser | P: Pen | H: Highlighter</div>
        <div>N: Notes | C: Clear annotations</div>
        <div>Home/End: First/Last</div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 z-[9999]">
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
