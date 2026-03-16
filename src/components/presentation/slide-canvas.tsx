'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Minus, Plus, Trash2, GripVertical } from 'lucide-react';
import { usePresentationStore, type SlideElement, WORDART_STYLES } from '@/store/presentation-store';
import { SHAPE_DEFINITIONS } from '@/components/shared/shapes-icons-library';

// ── Inline Table Renderer ────────────────────────────────────────────────────
function TableElement({ el, isSelected, scale }: { el: SlideElement; isSelected: boolean; scale: number }) {
  const { updateElement, activeSlideIndex, pushUndo } = usePresentationStore();
  const td = el.tableData;
  if (!td) return null;

  const handleCellEdit = (row: number, col: number, value: string) => {
    if (!td) return;
    pushUndo();
    const newCells = td.cells.map((r, ri) => r.map((c, ci) => (ri === row && ci === col ? value : c)));
    updateElement(activeSlideIndex, el.id, { tableData: { ...td, cells: newCells } });
  };

  const cellW = el.width / td.cols;
  const cellH = el.height / td.rows;

  const getTableStyle = () => {
    switch (td.tableStyle) {
      case 'striped': return { evenBg: 'rgba(59,130,246,0.1)', headerBg: 'rgba(59,130,246,0.4)' };
      case 'bordered': return { evenBg: 'rgba(255,255,255,0.05)', headerBg: 'rgba(59,130,246,0.3)', border: '2px solid rgba(59,130,246,0.5)' };
      case 'minimal': return { evenBg: 'transparent', headerBg: 'transparent', border: '1px solid rgba(255,255,255,0.1)' };
      case 'colorful': return { evenBg: 'rgba(168,85,247,0.1)', headerBg: 'rgba(168,85,247,0.4)' };
      default: return { evenBg: 'rgba(255,255,255,0.05)', headerBg: 'rgba(59,130,246,0.3)' };
    }
  };

  const tableStyle = getTableStyle();

  return (
    <div style={{ width: el.width, height: el.height }}>
      <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontSize: el.style.fontSize || 12, color: el.style.color || '#000' }}>
        <tbody>
          {td.cells.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}
                  contentEditable={isSelected}
                  suppressContentEditableWarning
                  onBlur={(e) => handleCellEdit(ri, ci, e.currentTarget.textContent || '')}
                  style={{
                    border: tableStyle.border || '1px solid rgba(0,0,0,0.2)',
                    padding: '2px 4px',
                    background: ri === 0 && td.headerRow ? tableStyle.headerBg : (ri % 2 === 0 ? tableStyle.evenBg : 'rgba(255,255,255,0.05)'),
                    fontWeight: ri === 0 && td.headerRow ? 'bold' : 'normal',
                    minWidth: cellW, minHeight: cellH,
                    outline: 'none',
                    verticalAlign: 'top',
                    wordBreak: 'break-word',
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

// ── Inline Chart Renderer ────────────────────────────────────────────────────
function ChartElement({ el }: { el: SlideElement }) {
  const cd = el.chartData;
  if (!cd) return null;

  const maxVal = Math.max(...cd.datasets.flatMap(d => d.data), 1);
  const padding = 40;
  const chartW = el.width - padding * 2;
  const chartH = el.height - padding * 2 - 20;

  if (cd.chartType === 'pie' || cd.chartType === 'doughnut') {
    const total = cd.datasets[0]?.data.reduce((a, b) => a + b, 0) || 1;
    let cumAngle = -Math.PI / 2;
    const cx = el.width / 2;
    const cy = el.height / 2;
    const r = Math.min(cx, cy) - 30;
    const innerR = cd.chartType === 'doughnut' ? r * 0.5 : 0;
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];

    return (
      <svg width={el.width} height={el.height}>
        {cd.datasets[0]?.data.map((val, i) => {
          const angle = (val / total) * Math.PI * 2;
          const x1 = cx + r * Math.cos(cumAngle);
          const y1 = cy + r * Math.sin(cumAngle);
          const x2 = cx + r * Math.cos(cumAngle + angle);
          const y2 = cy + r * Math.sin(cumAngle + angle);
          const ix1 = cx + innerR * Math.cos(cumAngle);
          const iy1 = cy + innerR * Math.sin(cumAngle);
          const ix2 = cx + innerR * Math.cos(cumAngle + angle);
          const iy2 = cy + innerR * Math.sin(cumAngle + angle);
          const largeArc = angle > Math.PI ? 1 : 0;
          const path = innerR > 0
            ? `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
            : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          cumAngle += angle;
          return <path key={i} d={path} fill={colors[i % colors.length]} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />;
        })}
        {cd.labels.map((label, i) => {
          const midAngle = -Math.PI / 2 + cd.datasets[0].data.slice(0, i).reduce((a, b) => a + b, 0) / total * Math.PI * 2 + (cd.datasets[0].data[i] / total) * Math.PI;
          const lx = cx + (r + 16) * Math.cos(midAngle);
          const ly = cy + (r + 16) * Math.sin(midAngle);
          return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.8)" fontSize={9}>{label}</text>;
        })}
      </svg>
    );
  }

  const barGroupW = chartW / cd.labels.length;
  const barW = barGroupW / (cd.datasets.length + 1);

  return (
    <svg width={el.width} height={el.height}>
      <line x1={padding} y1={padding} x2={padding} y2={padding + chartH} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      <line x1={padding} y1={padding + chartH} x2={padding + chartW} y2={padding + chartH} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={padding} y1={padding + chartH * (1 - f)} x2={padding + chartW} y2={padding + chartH * (1 - f)}
          stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} strokeDasharray="4 4" />
      ))}
      {cd.labels.map((label, i) => (
        <text key={i} x={padding + barGroupW * i + barGroupW / 2} y={padding + chartH + 14}
          textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={9}>{label}</text>
      ))}
      {cd.chartType === 'line' ? (
        cd.datasets.map((ds, di) => {
          const points = ds.data.map((v, i) => ({
            x: padding + barGroupW * i + barGroupW / 2,
            y: padding + chartH - (v / maxVal) * chartH,
          }));
          return (
            <g key={di}>
              <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none" stroke={ds.color} strokeWidth={2} />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} fill={ds.color} />
              ))}
            </g>
          );
        })
      ) : (
        cd.datasets.map((ds, di) =>
          ds.data.map((v, i) => {
            const barH = (v / maxVal) * chartH;
            const x = padding + barGroupW * i + barW * (di + 0.5);
            return (
              <rect key={`${di}-${i}`} x={x} y={padding + chartH - barH}
                width={barW * 0.8} height={barH} fill={ds.color} rx={2} opacity={0.85} />
            );
          })
        )
      )}
      {cd.datasets.map((ds, di) => (
        <g key={di}>
          <rect x={padding + di * 80} y={el.height - 14} width={8} height={8} fill={ds.color} rx={1} />
          <text x={padding + di * 80 + 12} y={el.height - 6} fill="rgba(255,255,255,0.7)" fontSize={9}>{ds.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Resize Handle ────────────────────────────────────────────────────────────
function ResizeHandle({ position, onResize }: { position: string; onResize: (dx: number, dy: number, pos: string) => void }) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const handleMouseMove = (me: MouseEvent) => {
      onResize(me.clientX - startX, me.clientY - startY, position);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const posStyles: Record<string, React.CSSProperties> = {
    'nw': { top: -4, left: -4, cursor: 'nw-resize' },
    'ne': { top: -4, right: -4, cursor: 'ne-resize' },
    'sw': { bottom: -4, left: -4, cursor: 'sw-resize' },
    'se': { bottom: -4, right: -4, cursor: 'se-resize' },
    'n': { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
    's': { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
    'e': { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' },
    'w': { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' },
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute z-10"
      style={{
        width: 8, height: 8, background: '#3b82f6', border: '1px solid white',
        borderRadius: 1, ...posStyles[position],
      }}
    />
  );
}

// ── Smart Guide Lines ────────────────────────────────────────────────────────
function SmartGuides({ dragElement, elements, show }: { dragElement: SlideElement | null; elements: SlideElement[]; show: boolean }) {
  if (!show || !dragElement) return null;

  const guides: React.ReactNode[] = [];
  const threshold = 5;
  const centerX = dragElement.x + dragElement.width / 2;
  const centerY = dragElement.y + dragElement.height / 2;

  elements.forEach(el => {
    if (el.id === dragElement.id) return;
    const elCenterX = el.x + el.width / 2;
    const elCenterY = el.y + el.height / 2;

    // Center alignment guides
    if (Math.abs(centerX - elCenterX) < threshold) {
      guides.push(
        <div key={`cx-${el.id}`} className="absolute pointer-events-none" style={{
          left: elCenterX, top: Math.min(dragElement.y, el.y),
          width: 1, height: Math.abs(dragElement.y - el.y) + Math.max(dragElement.height, el.height),
          background: '#f59e0b', zIndex: 100,
        }} />
      );
    }
    if (Math.abs(centerY - elCenterY) < threshold) {
      guides.push(
        <div key={`cy-${el.id}`} className="absolute pointer-events-none" style={{
          top: elCenterY, left: Math.min(dragElement.x, el.x),
          height: 1, width: Math.abs(dragElement.x - el.x) + Math.max(dragElement.width, el.width),
          background: '#f59e0b', zIndex: 100,
        }} />
      );
    }
    // Edge alignment
    if (Math.abs(dragElement.x - el.x) < threshold) {
      guides.push(
        <div key={`lx-${el.id}`} className="absolute pointer-events-none" style={{
          left: el.x, top: Math.min(dragElement.y, el.y),
          width: 1, height: Math.abs(dragElement.y - el.y) + Math.max(dragElement.height, el.height),
          background: '#3b82f6', zIndex: 100,
        }} />
      );
    }
    if (Math.abs((dragElement.x + dragElement.width) - (el.x + el.width)) < threshold) {
      guides.push(
        <div key={`rx-${el.id}`} className="absolute pointer-events-none" style={{
          left: el.x + el.width, top: Math.min(dragElement.y, el.y),
          width: 1, height: Math.abs(dragElement.y - el.y) + Math.max(dragElement.height, el.height),
          background: '#3b82f6', zIndex: 100,
        }} />
      );
    }
  });

  return <>{guides}</>;
}

// ── Main Canvas Component ────────────────────────────────────────────────────
export default function SlideCanvas() {
  const {
    slides, activeSlideIndex, selectedElementId,
    selectElement, updateElementContent, updateElement,
    canvasZoom, setCanvasZoom, showGrid, showRuler, showGuides,
    snapToGrid, snapToObjects, pushUndo, removeElement,
  } = usePresentationStore();

  const slide = slides[activeSlideIndex];
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ id: string; startW: number; startH: number; startX: number; startY: number } | null>(null);
  const [dragElement, setDragElement] = useState<SlideElement | null>(null);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        selectElement(null);
      }
    },
    [selectElement],
  );

  const handleElementMouseDown = useCallback((e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    selectElement(el.id);
    if (el.locked) return;
    pushUndo();
    const scale = canvasZoom / 100;
    setDragState({
      id: el.id,
      startX: e.clientX / scale,
      startY: e.clientY / scale,
      elX: el.x,
      elY: el.y,
    });
    setDragElement(el);
  }, [selectElement, canvasZoom, pushUndo]);

  useEffect(() => {
    if (!dragState) return;
    const scale = canvasZoom / 100;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX / scale - dragState.startX;
      const dy = e.clientY / scale - dragState.startY;
      let newX = Math.round(dragState.elX + dx);
      let newY = Math.round(dragState.elY + dy);
      if (snapToGrid) {
        newX = Math.round(newX / 24) * 24;
        newY = Math.round(newY / 24) * 24;
      }
      updateElement(activeSlideIndex, dragState.id, { x: newX, y: newY });
      // Update drag element for smart guides
      const el = slides[activeSlideIndex]?.elements.find(e => e.id === dragState.id);
      if (el) setDragElement({ ...el, x: newX, y: newY });
    };
    const handleMouseUp = () => {
      setDragState(null);
      setDragElement(null);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, canvasZoom, snapToGrid, activeSlideIndex, updateElement, slides]);

  const handleResize = useCallback((elementId: string, el: SlideElement) => {
    return (dx: number, dy: number, pos: string) => {
      const scale = canvasZoom / 100;
      const sdx = dx / scale;
      const sdy = dy / scale;
      let newW = el.width;
      let newH = el.height;
      let newX = el.x;
      let newY = el.y;

      if (pos.includes('e')) newW = Math.max(40, el.width + sdx);
      if (pos.includes('w')) { newW = Math.max(40, el.width - sdx); newX = el.x + sdx; }
      if (pos.includes('s')) newH = Math.max(20, el.height + sdy);
      if (pos.includes('n')) { newH = Math.max(20, el.height - sdy); newY = el.y + sdy; }

      updateElement(activeSlideIndex, elementId, { x: Math.round(newX), y: Math.round(newY), width: Math.round(newW), height: Math.round(newH) });
    };
  }, [canvasZoom, activeSlideIndex, updateElement]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementId) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.getAttribute('contenteditable') === 'true' || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
        pushUndo();
        removeElement(activeSlideIndex, selectedElementId);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedElementId, activeSlideIndex, removeElement, pushUndo]);

  if (!slide) return null;

  const scale = canvasZoom / 100;

  const renderElement = (el: SlideElement) => {
    const isSelected = el.id === selectedElementId;

    const shapeTransform: string[] = [];
    if (el.rotation) shapeTransform.push(`rotate(${el.rotation}deg)`);
    if (el.style.rotateX) shapeTransform.push(`rotateX(${el.style.rotateX}deg)`);
    if (el.style.rotateY) shapeTransform.push(`rotateY(${el.style.rotateY}deg)`);
    const perspectiveStyle: React.CSSProperties =
      (el.style.rotateX || el.style.rotateY) ? { perspective: 600, transformStyle: 'preserve-3d' as const } : {};

    // Shadow and effects
    const effectStyles: React.CSSProperties = {};
    if (el.style.shadow) {
      effectStyles.boxShadow = `${el.style.shadowOffsetX || 4}px ${el.style.shadowOffsetY || 4}px ${el.style.shadowBlur || 12}px ${el.style.shadowColor || 'rgba(0,0,0,0.4)'}`;
    }
    if (el.style.glow) {
      effectStyles.boxShadow = `0 0 15px ${el.style.glowColor || '#3b82f6'}, 0 0 30px ${el.style.glowColor || '#3b82f6'}40`;
    }
    if (el.style.reflection) {
      effectStyles.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))';
    }

    const commonStyle: React.CSSProperties = {
      left: el.x, top: el.y, width: el.width, height: el.type === 'text' ? undefined : el.height,
      minHeight: el.type === 'text' ? el.height : undefined,
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      outlineOffset: 2,
      opacity: el.style.opacity ?? 1,
      ...effectStyles,
    };

    // Group indicator
    if (el.groupId && isSelected) {
      commonStyle.outlineStyle = 'dashed';
    }

    // Media element
    if (el.type === 'media' && el.mediaData) {
      return (
        <div key={el.id} className="absolute cursor-move"
          onMouseDown={(e) => handleElementMouseDown(e, el)}
          style={{ ...commonStyle, height: el.height }}>
          {el.mediaData.mediaType === 'video' ? (
            <div className="w-full h-full bg-black/50 rounded flex items-center justify-center relative">
              <iframe src={el.mediaData.url} className="w-full h-full rounded" style={{ border: 'none' }} />
            </div>
          ) : el.mediaData.mediaType === 'audio' ? (
            <div className="w-full h-full bg-black/30 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">🎵</div>
                <audio controls src={el.mediaData.url} className="w-full" />
              </div>
            </div>
          ) : null}
          {isSelected && ['nw', 'ne', 'sw', 'se'].map((pos) => (
            <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
          ))}
        </div>
      );
    }

    // Table
    if (el.type === 'table') {
      return (
        <div key={el.id} className="absolute cursor-move"
          onMouseDown={(e) => handleElementMouseDown(e, el)}
          style={{ ...commonStyle, height: el.height }}>
          <TableElement el={el} isSelected={isSelected} scale={scale} />
          {isSelected && ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((pos) => (
            <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
          ))}
        </div>
      );
    }

    // Chart
    if (el.type === 'chart') {
      return (
        <div key={el.id} className="absolute cursor-move"
          onMouseDown={(e) => handleElementMouseDown(e, el)}
          style={{ ...commonStyle, height: el.height, background: el.style.backgroundColor, borderRadius: 4 }}>
          <ChartElement el={el} />
          {isSelected && ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((pos) => (
            <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
          ))}
        </div>
      );
    }

    // Image
    if (el.type === 'image') {
      return (
        <div key={el.id} className="absolute cursor-move"
          onMouseDown={(e) => handleElementMouseDown(e, el)}
          style={{ ...commonStyle, height: el.height, transform: shapeTransform.length > 0 ? shapeTransform.join(' ') : undefined }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={el.content} alt="Slide image" className="w-full h-full object-contain" draggable={false} />
          {isSelected && ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((pos) => (
            <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
          ))}
        </div>
      );
    }

    // Shape
    if (el.type === 'shape') {
      const shapeColor = el.style.backgroundColor || '#3b82f6';
      const borderStyle = el.style.borderWidth ? `${el.style.borderWidth}px solid ${el.style.borderColor || '#000'}` : 'none';
      const shadowStyle = el.style.shadow ? `${el.style.shadowOffsetX || 4}px ${el.style.shadowOffsetY || 4}px ${el.style.shadowBlur || 12}px ${el.style.shadowColor || 'rgba(0,0,0,0.4)'}` : 'none';

      let shapeSpecificStyle: React.CSSProperties = {
        ...commonStyle,
        height: el.height,
        backgroundColor: shapeColor,
        borderRadius: el.style.borderRadius || '0',
        border: borderStyle,
        boxShadow: shadowStyle,
        transform: shapeTransform.length > 0 ? shapeTransform.join(' ') : undefined,
        ...perspectiveStyle,
      };

      const advancedShape = SHAPE_DEFINITIONS.find(s => s.id === el.content);
      if (advancedShape) {
        return (
          <div key={el.id} className="absolute cursor-move"
            onMouseDown={(e) => handleElementMouseDown(e, el)}
            style={{
              ...commonStyle, height: el.height,
              transform: shapeTransform.length > 0 ? shapeTransform.join(' ') : undefined,
              ...perspectiveStyle,
            }}>
            <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
              <path d={advancedShape.svgPath} fill={shapeColor} fillOpacity={0.8} stroke={el.style.borderColor || shapeColor} strokeWidth={2} />
            </svg>
            {isSelected && ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((pos) => (
              <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
            ))}
          </div>
        );
      }

      if (el.content.startsWith('icon:')) {
        return (
          <div key={el.id} className="absolute cursor-move flex items-center justify-center"
            onMouseDown={(e) => handleElementMouseDown(e, el)}
            style={{ ...commonStyle, height: el.height, color: el.style.color || '#3b82f6', fontSize: Math.min(el.width, el.height) * 0.6, transform: shapeTransform.length > 0 ? shapeTransform.join(' ') : undefined, ...perspectiveStyle }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 100 100" width={el.width * 0.7} height={el.height * 0.7}>
                <circle cx="50" cy="50" r="40" fill={el.style.color || '#3b82f6'} fillOpacity={0.15} stroke={el.style.color || '#3b82f6'} strokeWidth={2} />
                <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fill={el.style.color || '#3b82f6'} fontSize="24" fontWeight="bold">
                  {el.content.replace('icon:', '').charAt(0).toUpperCase()}
                </text>
              </svg>
            </div>
            {isSelected && ['nw', 'ne', 'sw', 'se'].map((pos) => (
              <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
            ))}
          </div>
        );
      }

      // Extended shapes
      if (el.content === 'arrow') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(0 25%, 65% 25%, 65% 0, 100% 50%, 65% 100%, 65% 75%, 0 75%)', background: shapeColor };
      } else if (el.content === 'arrow-left') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(100% 25%, 35% 25%, 35% 0, 0 50%, 35% 100%, 35% 75%, 100% 75%)', background: shapeColor };
      } else if (el.content === 'arrow-up') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(25% 100%, 25% 35%, 0 35%, 50% 0, 100% 35%, 75% 35%, 75% 100%)', background: shapeColor };
      } else if (el.content === 'arrow-down') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(25% 0, 25% 65%, 0 65%, 50% 100%, 100% 65%, 75% 65%, 75% 0)', background: shapeColor };
      } else if (el.content === 'arrow-double') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(0 50%, 25% 0, 25% 25%, 75% 25%, 75% 0, 100% 50%, 75% 100%, 75% 75%, 25% 75%, 25% 100%)', background: shapeColor };
      } else if (el.content === 'star') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', background: shapeColor };
      } else if (el.content === 'diamond') {
        const extraTransform = shapeTransform.length > 0 ? shapeTransform.join(' ') + ' ' : '';
        shapeSpecificStyle = { ...shapeSpecificStyle, transform: `${extraTransform}rotate(45deg)`, borderRadius: '0' };
      } else if (el.content === 'triangle') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: shapeColor };
      } else if (el.content === 'hexagon') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', background: shapeColor };
      } else if (el.content === 'pentagon') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', background: shapeColor };
      } else if (el.content === 'heart') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(50% 85%, 15% 55%, 0% 35%, 0% 20%, 10% 5%, 25% 0%, 40% 5%, 50% 20%, 60% 5%, 75% 0%, 90% 5%, 100% 20%, 100% 35%, 85% 55%)', background: shapeColor };
      } else if (el.content === 'cross') {
        shapeSpecificStyle = { ...shapeSpecificStyle, backgroundColor: 'transparent', clipPath: 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)', background: shapeColor };
      } else if (el.content === 'cloud') {
        return (
          <div key={el.id} className="absolute cursor-move"
            onMouseDown={(e) => handleElementMouseDown(e, el)}
            style={{ ...commonStyle, height: el.height, ...perspectiveStyle }}>
            <svg viewBox="0 0 100 60" width={el.width} height={el.height}>
              <ellipse cx="35" cy="40" rx="25" ry="18" fill={shapeColor} />
              <ellipse cx="65" cy="40" rx="25" ry="18" fill={shapeColor} />
              <ellipse cx="50" cy="25" rx="30" ry="22" fill={shapeColor} />
              <ellipse cx="25" cy="30" rx="20" ry="15" fill={shapeColor} />
              <ellipse cx="75" cy="30" rx="20" ry="15" fill={shapeColor} />
            </svg>
            {isSelected && ['nw', 'ne', 'sw', 'se'].map((pos) => (
              <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
            ))}
          </div>
        );
      } else if (el.content === 'line' || el.content === 'curve') {
        shapeSpecificStyle = { ...shapeSpecificStyle, height: 3, backgroundColor: shapeColor, borderRadius: 0 };
      } else if (el.content === 'callout' || el.content === 'callout-round') {
        return (
          <div key={el.id} className="absolute cursor-move"
            onMouseDown={(e) => handleElementMouseDown(e, el)}
            style={{ ...commonStyle, height: el.height, boxShadow: shadowStyle, transform: shapeTransform.length > 0 ? shapeTransform.join(' ') : undefined, ...perspectiveStyle }}>
            <div style={{ width: '100%', height: 'calc(100% - 10px)', backgroundColor: shapeColor, borderRadius: el.content === 'callout-round' ? '50%' : 8, border: borderStyle }} />
            <div style={{ position: 'absolute', bottom: 0, left: 20, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `10px solid ${shapeColor}` }} />
            {isSelected && ['nw', 'ne', 'sw', 'se'].map((pos) => (
              <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
            ))}
          </div>
        );
      } else if (el.content === 'rounded-rect') {
        shapeSpecificStyle = { ...shapeSpecificStyle, borderRadius: '12px' };
      }

      return (
        <div key={el.id} className="absolute cursor-move"
          onMouseDown={(e) => handleElementMouseDown(e, el)}
          style={shapeSpecificStyle}>
          {isSelected && ['nw', 'ne', 'sw', 'se'].map((pos) => (
            <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
          ))}
        </div>
      );
    }

    // Text element with WordArt/effects support
    const textEffectStyle: React.CSSProperties = {};
    if (el.textEffect) {
      if (el.textEffect.wordArt) {
        const wa = WORDART_STYLES.find(w => w.id === el.textEffect?.wordArt);
        if (wa) {
          if (wa.id.includes('gradient') || wa.id === 'wa-outline') {
            if (wa.id === 'wa-gradient-blue') { textEffectStyle.background = 'linear-gradient(to right, #3b82f6, #06b6d4)'; textEffectStyle.WebkitBackgroundClip = 'text'; textEffectStyle.WebkitTextFillColor = 'transparent'; }
            else if (wa.id === 'wa-gradient-fire') { textEffectStyle.background = 'linear-gradient(to right, #f97316, #ef4444)'; textEffectStyle.WebkitBackgroundClip = 'text'; textEffectStyle.WebkitTextFillColor = 'transparent'; }
            else if (wa.id === 'wa-gradient-rainbow') { textEffectStyle.background = 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7)'; textEffectStyle.WebkitBackgroundClip = 'text'; textEffectStyle.WebkitTextFillColor = 'transparent'; }
            else if (wa.id === 'wa-outline') { textEffectStyle.WebkitTextStroke = '1px currentColor'; textEffectStyle.WebkitTextFillColor = 'transparent'; }
          }
          if (wa.id === 'wa-shadow') textEffectStyle.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
          if (wa.id === 'wa-glow') textEffectStyle.textShadow = '0 0 10px currentColor, 0 0 20px currentColor';
          if (wa.id === 'wa-3d') textEffectStyle.textShadow = '1px 1px 0 #ccc, 2px 2px 0 #999, 3px 3px 0 #666';
          if (wa.id === 'wa-neon') textEffectStyle.textShadow = '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #3b82f6, 0 0 20px #3b82f6';
        }
      }
      if (el.textEffect.textShadow) textEffectStyle.textShadow = el.textEffect.textShadow;
      if (el.textEffect.gradientFill) {
        textEffectStyle.background = el.textEffect.gradientFill;
        textEffectStyle.WebkitBackgroundClip = 'text';
        textEffectStyle.WebkitTextFillColor = 'transparent';
      }
      if (el.textEffect.textReflection) {
        textEffectStyle.filter = 'drop-shadow(0 2px 3px rgba(255,255,255,0.15))';
      }
      if (el.textEffect.text3DRotateX || el.textEffect.text3DRotateY) {
        textEffectStyle.transform = `perspective(600px) rotateX(${el.textEffect.text3DRotateX || 0}deg) rotateY(${el.textEffect.text3DRotateY || 0}deg)`;
      }
      if (el.textEffect.glowColor) {
        textEffectStyle.textShadow = `0 0 ${el.textEffect.glowSize || 10}px ${el.textEffect.glowColor}`;
      }
    }

    return (
      <div key={el.id}
        onMouseDown={(e) => handleElementMouseDown(e, el)}
        className="absolute cursor-move"
        style={{
          ...commonStyle,
          outline: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
          ...effectStyles,
        }}>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const text = e.currentTarget.textContent || '';
            updateElementContent(activeSlideIndex, el.id, text);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full outline-none cursor-text"
          style={{
            fontSize: el.style.fontSize || 20,
            fontWeight: el.style.fontWeight || 'normal',
            fontStyle: el.style.fontStyle || 'normal',
            fontFamily: el.style.fontFamily || 'Arial',
            textDecoration: el.style.textDecoration || 'none',
            textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) || 'left',
            lineHeight: el.style.lineHeight ? `${el.style.lineHeight}` : undefined,
            letterSpacing: el.style.letterSpacing ? `${el.style.letterSpacing}px` : undefined,
            color: el.style.color || '#ffffff',
            wordBreak: 'break-word',
            ...textEffectStyle,
          }}>
          {el.content}
        </div>
        {isSelected && ['nw', 'ne', 'sw', 'se', 'e', 'w'].map((pos) => (
          <ResizeHandle key={pos} position={pos} onResize={handleResize(el.id, el)} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Ruler */}
      {showRuler && (
        <div className="flex" style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 30, minWidth: 30 }} />
          <div className="flex-1 relative" style={{ height: 20 }}>
            {Array.from({ length: Math.ceil(960 * scale / 50) }, (_, i) => (
              <div key={i} className="absolute text-[8px]" style={{
                left: i * 50, top: 0, color: 'var(--muted-foreground)',
                borderLeft: '1px solid var(--border)', height: '100%', paddingLeft: 2, paddingTop: 1,
              }}>
                {Math.round(i * 50 / scale)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {showRuler && (
          <div className="relative" style={{ width: 20, minWidth: 20, background: 'var(--muted)', borderRight: '1px solid var(--border)' }}>
            {Array.from({ length: Math.ceil(540 * scale / 50) }, (_, i) => (
              <div key={i} className="absolute text-[8px]" style={{
                top: i * 50, left: 0, color: 'var(--muted-foreground)',
                borderTop: '1px solid var(--border)', width: '100%', paddingLeft: 2, paddingTop: 1,
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
              }}>
                {Math.round(i * 50 / scale)}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div
            ref={canvasRef}
            className="relative shadow-2xl"
            onClick={handleCanvasClick}
            style={{
              width: 960, height: 540,
              maxWidth: '100%',
              background: slide.background,
              aspectRatio: '16/9',
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}>
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: snapToGrid ? '24px 24px' : '48px 48px',
                zIndex: 50,
              }} />
            )}

            {showGuides && (
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
                <div className="absolute left-1/2 top-0 bottom-0" style={{ width: 1, background: 'rgba(59,130,246,0.3)', transform: 'translateX(-0.5px)' }} />
                <div className="absolute top-1/2 left-0 right-0" style={{ height: 1, background: 'rgba(59,130,246,0.3)', transform: 'translateY(-0.5px)' }} />
                <div className="absolute left-1/3 top-0 bottom-0" style={{ width: 1, background: 'rgba(59,130,246,0.15)', transform: 'translateX(-0.5px)' }} />
                <div className="absolute left-2/3 top-0 bottom-0" style={{ width: 1, background: 'rgba(59,130,246,0.15)', transform: 'translateX(-0.5px)' }} />
              </div>
            )}

            {/* Smart guides */}
            <SmartGuides dragElement={dragElement} elements={slide.elements} show={snapToObjects && !!dragState} />

            {slide.elements.map(renderElement)}

            {slide.slideNumberVisible !== false && (
              <div className="absolute bottom-2 right-3 text-white/60 font-medium" style={{ fontSize: 12 }}>
                {activeSlideIndex + 1}
              </div>
            )}
            {slide.footerText && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/40" style={{ fontSize: 10 }}>
                {slide.footerText}
              </div>
            )}
            {slide.dateTimeVisible && (
              <div className="absolute bottom-2 left-3 text-white/40" style={{ fontSize: 10 }}>
                {new Date().toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 px-4 py-1 border-t"
        style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
        <button onClick={() => setCanvasZoom(Math.max(25, canvasZoom - 10))}
          className="p-1 rounded hover:opacity-80" style={{ color: 'var(--foreground)' }} title="Zoom out">
          <Minus size={14} />
        </button>
        <input type="range" min={25} max={200} step={5} value={canvasZoom}
          onChange={(e) => setCanvasZoom(parseInt(e.target.value))}
          className="w-32 h-1.5 rounded appearance-none cursor-pointer" style={{ accentColor: 'var(--primary)' }} />
        <button onClick={() => setCanvasZoom(Math.min(200, canvasZoom + 10))}
          className="p-1 rounded hover:opacity-80" style={{ color: 'var(--foreground)' }} title="Zoom in">
          <Plus size={14} />
        </button>
        <span className="text-xs font-medium w-10 text-center" style={{ color: 'var(--foreground)' }}>{canvasZoom}%</span>
        <button onClick={() => setCanvasZoom(100)}
          className="text-xs px-2 py-0.5 rounded border hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
          Fit
        </button>
      </div>
    </div>
  );
}
