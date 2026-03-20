'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Shield, Loader2, AlertTriangle, FileText, ChevronDown, ChevronRight,
  ExternalLink, Download, ToggleLeft, ToggleRight,
} from 'lucide-react';

function getMatchColor(pct: number): string {
  if (pct >= 80) return 'text-red-400';
  if (pct >= 50) return 'text-orange-400';
  return 'text-yellow-400';
}

function getMatchBg(pct: number): string {
  if (pct >= 80) return 'bg-red-400/10 border-red-400/30';
  if (pct >= 50) return 'bg-orange-400/10 border-orange-400/30';
  return 'bg-yellow-400/10 border-yellow-400/30';
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 30 ? '#f87171' : score >= 15 ? '#fb923c' : '#4ade80';
  const circumference = 2 * Math.PI * 36;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="36" fill="none" stroke="var(--border)" strokeWidth="6" opacity={0.3} />
        <circle
          cx="48" cy="48" r="36" fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-[10px] opacity-50">similarity</span>
      </div>
    </div>
  );
}

export default function PlagiarismPanel() {
  const {
    plagiarismResult, plagiarismChecking, runPlagiarismCheck,
    setPlagiarismExcludeQuotes, setPlagiarismExcludeBibliography,
    sections,
  } = useResearchStore();

  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--foreground)' }}>
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} style={{ color: 'var(--primary)' }} />
          <h3 className="text-xs font-semibold">Plagiarism Checker</h3>
        </div>

        <button
          onClick={runPlagiarismCheck}
          disabled={plagiarismChecking}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded font-medium disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {plagiarismChecking ? (
            <><Loader2 size={14} className="animate-spin" /> Checking...</>
          ) : (
            <><Shield size={14} /> Run Plagiarism Check</>
          )}
        </button>
      </div>

      {plagiarismResult && (
        <div className="flex-1 overflow-y-auto">
          {/* Score */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <ScoreRing score={plagiarismResult.overallScore} />
            <p className="text-center text-[10px] opacity-50 mt-2">
              Checked at {new Date(plagiarismResult.checkedAt).toLocaleTimeString()}
            </p>
          </div>

          {/* Toggles */}
          <div className="p-3 border-b space-y-2" style={{ borderColor: 'var(--border)' }}>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="opacity-70">Exclude quotes</span>
              <button onClick={() => setPlagiarismExcludeQuotes(!plagiarismResult.excludeQuotes)}>
                {plagiarismResult.excludeQuotes ? (
                  <ToggleRight size={20} style={{ color: 'var(--primary)' }} />
                ) : (
                  <ToggleLeft size={20} className="opacity-40" />
                )}
              </button>
            </label>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="opacity-70">Exclude bibliography</span>
              <button onClick={() => setPlagiarismExcludeBibliography(!plagiarismResult.excludeBibliography)}>
                {plagiarismResult.excludeBibliography ? (
                  <ToggleRight size={20} style={{ color: 'var(--primary)' }} />
                ) : (
                  <ToggleLeft size={20} className="opacity-40" />
                )}
              </button>
            </label>
          </div>

          {/* Matches */}
          <div className="p-2">
            <p className="text-[10px] uppercase tracking-wider opacity-40 px-2 mb-2">
              Matches ({plagiarismResult.matches.length})
            </p>
            {plagiarismResult.matches.map((match) => {
              const section = sections.find((s) => s.id === match.sectionId);
              const expanded = expandedMatch === match.id;
              return (
                <div
                  key={match.id}
                  className={cn('border rounded-lg mb-2 overflow-hidden', getMatchBg(match.matchPercentage))}
                >
                  <button
                    onClick={() => setExpandedMatch(expanded ? null : match.id)}
                    className="w-full flex items-center gap-2 p-2 text-left"
                  >
                    {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span className={cn('text-xs font-bold tabular-nums', getMatchColor(match.matchPercentage))}>
                      {match.matchPercentage}%
                    </span>
                    <span className="text-[10px] opacity-60 flex-1 truncate">{section?.title || 'Unknown'}</span>
                  </button>
                  {expanded && (
                    <div className="px-3 pb-3 space-y-2">
                      <p className="text-xs italic opacity-80 leading-relaxed border-l-2 pl-2" style={{ borderColor: 'var(--primary)' }}>
                        &ldquo;{match.text}&rdquo;
                      </p>
                      <div className="flex items-center gap-1 text-[10px] opacity-60">
                        <FileText size={10} />
                        <span className="truncate flex-1">{match.source}</span>
                        <a className="shrink-0 hover:opacity-100" title="Open source">
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Report button */}
          <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded border opacity-70 hover:opacity-100"
              style={{ borderColor: 'var(--border)' }}>
              <Download size={12} /> Generate Report
            </button>
          </div>
        </div>
      )}

      {!plagiarismResult && !plagiarismChecking && (
        <div className="flex-1 flex flex-col items-center justify-center opacity-40 p-6">
          <AlertTriangle size={28} className="mb-2" />
          <p className="text-xs text-center">Run a plagiarism check to detect potential similarity with published sources</p>
        </div>
      )}
    </div>
  );
}
