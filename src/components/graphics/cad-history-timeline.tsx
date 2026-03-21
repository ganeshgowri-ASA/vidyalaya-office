'use client';
import React from 'react';
import { useCADStore } from '@/store/cad-store';
import { useGraphicsStore } from '@/store/graphics-store';

export default function CADHistoryTimeline() {
  const { visualHistory } = useCADStore();
  const { historyIndex, history, undo, redo } = useGraphicsStore();

  const totalSteps = history.length;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < totalSteps - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#334155]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
          History ({totalSteps})
        </span>
        <div className="flex gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`px-2 py-0.5 rounded text-[10px] ${canUndo ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#0f172a] text-[#475569] cursor-not-allowed'}`}
          >
            ↩ Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`px-2 py-0.5 rounded text-[10px] ${canRedo ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#0f172a] text-[#475569] cursor-not-allowed'}`}
          >
            Redo ↪
          </button>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="px-3 py-2 border-b border-[#334155]">
        <div className="relative w-full h-3 bg-[#0f172a] rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600/60 rounded-full transition-all"
            style={{ width: totalSteps > 1 ? `${(historyIndex / (totalSteps - 1)) * 100}%` : '100%' }}
          />
          {/* Steps markers */}
          {totalSteps > 1 && totalSteps <= 30 && Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`absolute top-0.5 w-2 h-2 rounded-full cursor-pointer transition-colors ${
                i === historyIndex ? 'bg-white ring-1 ring-blue-400' : i < historyIndex ? 'bg-blue-400/80' : 'bg-[#475569]'
              }`}
              style={{ left: `calc(${(i / (totalSteps - 1)) * 100}% - 4px)` }}
              title={`Step ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[#94a3b8]">Step 1</span>
          <span className="text-[9px] text-blue-400 font-medium">
            Current: {historyIndex + 1} / {totalSteps}
          </span>
          <span className="text-[9px] text-[#94a3b8]">Step {totalSteps}</span>
        </div>
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {history.map((snapshot, i) => {
          const visual = visualHistory[i];
          const isCurrent = i === historyIndex;
          const isPast = i < historyIndex;

          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                isCurrent ? 'bg-blue-600/25 border border-blue-500/40' :
                isPast ? 'hover:bg-[#334155] border border-transparent opacity-80' :
                'hover:bg-[#334155] border border-transparent opacity-50'
              }`}
            >
              {/* Step indicator */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                isCurrent ? 'bg-blue-600 text-white' : isPast ? 'bg-[#334155] text-[#94a3b8]' : 'bg-[#0f172a] text-[#475569]'
              }`}>
                {i + 1}
              </div>

              {/* Thumbnail */}
              {visual?.thumbnail ? (
                <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0 bg-[#0f172a] border border-[#334155]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={visual.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-6 rounded bg-[#0f172a] border border-[#334155] flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] text-[#475569]">{snapshot.length}</span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] truncate">
                  {i === 0 ? 'Initial state' : visual?.label || `Edit ${i}`}
                </p>
                <p className="text-[8px] text-[#64748b]">
                  {snapshot.length} object{snapshot.length !== 1 ? 's' : ''}
                  {visual?.timestamp ? ` · ${new Date(visual.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
                </p>
              </div>

              {isCurrent && <span className="text-[8px] text-blue-400 font-semibold flex-shrink-0">NOW</span>}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="px-3 py-2 border-t border-[#334155] text-[10px] text-[#94a3b8] flex justify-between">
        <span>Undo: {historyIndex} steps</span>
        <span>Redo: {totalSteps - historyIndex - 1} steps</span>
      </div>
    </div>
  );
}
