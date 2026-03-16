'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold, Italic, List, Maximize2, Minimize2, Clock, Monitor,
  AlignLeft, AlignCenter, AlignRight, Type, ChevronUp, ChevronDown,
  Play, Pause, RotateCcw,
} from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

type NotesView = 'edit' | 'teleprompter';

export default function SpeakerNotes() {
  const { slides, activeSlideIndex, updateSlideNotes } = usePresentationStore();
  const slide = slides[activeSlideIndex];
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<NotesView>('edit');
  const [fontSize, setFontSize] = useState(14);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Teleprompter state
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2);
  const [teleprompterRunning, setTeleprompterRunning] = useState(false);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  useEffect(() => {
    if (teleprompterRunning && teleprompterRef.current) {
      scrollAnimRef.current = setInterval(() => {
        if (teleprompterRef.current) {
          teleprompterRef.current.scrollTop += teleprompterSpeed * 0.5;
          if (teleprompterRef.current.scrollTop >= teleprompterRef.current.scrollHeight - teleprompterRef.current.clientHeight) {
            setTeleprompterRunning(false);
          }
        }
      }, 50);
    } else if (scrollAnimRef.current) {
      clearInterval(scrollAnimRef.current);
    }
    return () => { if (scrollAnimRef.current) clearInterval(scrollAnimRef.current); };
  }, [teleprompterRunning, teleprompterSpeed]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  if (!slide) return null;

  const wordCount = slide.notes.trim() ? slide.notes.trim().split(/\s+/).length : 0;
  const estimatedMinutes = Math.ceil(wordCount / 150);

  if (view === 'teleprompter') {
    return (
      <div className="border-t no-print" style={{ borderColor: 'var(--border)', background: '#0a0a0a' }}>
        <div className="flex items-center justify-between px-3 py-1.5" style={{ background: '#1a1a2e' }}>
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-blue-400" />
            <span className="text-xs font-medium text-white/80">Teleprompter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50">Speed</span>
            <input type="range" min={1} max={10} value={teleprompterSpeed}
              onChange={e => setTeleprompterSpeed(parseInt(e.target.value))}
              className="w-16 h-1 appearance-none cursor-pointer" style={{ accentColor: '#3b82f6' }} />
            <button onClick={() => setTeleprompterRunning(!teleprompterRunning)}
              className="p-1 rounded hover:bg-white/10" title={teleprompterRunning ? 'Pause' : 'Play'}>
              {teleprompterRunning ? <Pause size={14} className="text-white/70" /> : <Play size={14} className="text-white/70" />}
            </button>
            <button onClick={() => { if (teleprompterRef.current) teleprompterRef.current.scrollTop = 0; }}
              className="p-1 rounded hover:bg-white/10" title="Reset">
              <RotateCcw size={14} className="text-white/70" />
            </button>
            <div className="text-white/60 font-mono text-xs ml-2">{formatTime(timerSeconds)}</div>
            <button onClick={() => setView('edit')}
              className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 hover:bg-white/20 ml-1">
              Exit
            </button>
          </div>
        </div>
        <div ref={teleprompterRef} className="overflow-y-auto px-8 py-4"
          style={{ height: expanded ? 300 : 150, background: '#0a0a0a' }}>
          <div className="text-white/90 leading-loose text-center max-w-2xl mx-auto"
            style={{ fontSize: fontSize + 4, lineHeight: 2.2 }}>
            {slide.notes || 'No notes for this slide.'}
          </div>
          <div style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t no-print" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Speaker Notes</span>
          {wordCount > 0 && (
            <span className="text-[10px] opacity-50">{wordCount} words (~{estimatedMinutes} min)</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Timer */}
          <div className="flex items-center gap-1 mr-2 border-r pr-2" style={{ borderColor: 'var(--border)' }}>
            <Clock size={11} className="opacity-50" />
            <span className="text-[10px] font-mono opacity-70">{formatTime(timerSeconds)}</span>
            <button onClick={() => setTimerRunning(!timerRunning)}
              className="p-0.5 rounded hover:opacity-80" title={timerRunning ? 'Pause' : 'Start'}>
              {timerRunning ? <Pause size={10} /> : <Play size={10} />}
            </button>
            <button onClick={resetTimer} className="p-0.5 rounded hover:opacity-80" title="Reset">
              <RotateCcw size={10} />
            </button>
          </div>
          {/* Formatting */}
          <button onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
            className="p-0.5 rounded hover:opacity-80" title="Bold"
            style={{ opacity: fontWeight === 'bold' ? 1 : 0.5 }}>
            <Bold size={12} />
          </button>
          <button onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
            className="p-0.5 rounded hover:opacity-80" title="Italic"
            style={{ opacity: fontStyle === 'italic' ? 1 : 0.5 }}>
            <Italic size={12} />
          </button>
          <button onClick={() => setTextAlign('left')} className="p-0.5 rounded hover:opacity-80"
            style={{ opacity: textAlign === 'left' ? 1 : 0.5 }}>
            <AlignLeft size={12} />
          </button>
          <button onClick={() => setTextAlign('center')} className="p-0.5 rounded hover:opacity-80"
            style={{ opacity: textAlign === 'center' ? 1 : 0.5 }}>
            <AlignCenter size={12} />
          </button>
          <div className="flex items-center gap-0.5 ml-1">
            <button onClick={() => setFontSize(Math.max(10, fontSize - 2))} className="p-0.5 rounded hover:opacity-80">
              <ChevronDown size={12} />
            </button>
            <span className="text-[10px] w-5 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-0.5 rounded hover:opacity-80">
              <ChevronUp size={12} />
            </button>
          </div>
          {/* Teleprompter */}
          <button onClick={() => { setView('teleprompter'); setTimerRunning(true); }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ml-1 border hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            title="Teleprompter Mode">
            <Monitor size={11} /> Teleprompter
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:opacity-80 ml-1"
            title={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>
      <textarea
        value={slide.notes}
        onChange={(e) => updateSlideNotes(activeSlideIndex, e.target.value)}
        placeholder="Add speaker notes for this slide... Use this area to write talking points, reminders, and key messages."
        className="w-full px-3 py-2 resize-none outline-none"
        style={{
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          height: expanded ? 200 : 80,
          transition: 'height 0.2s ease',
          fontSize,
          fontWeight,
          fontStyle,
          textAlign,
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}
