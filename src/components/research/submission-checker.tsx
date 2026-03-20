'use client';
import { useEffect } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, AlertTriangle, XCircle, ClipboardCheck,
  RefreshCw, FileText, BookOpen, Image, Users, Hash, MessageSquare,
} from 'lucide-react';

const statusIcon = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
};

const statusColor = {
  pass: 'text-green-400',
  warn: 'text-yellow-400',
  fail: 'text-red-400',
};

const statusBg = {
  pass: 'bg-green-400/10',
  warn: 'bg-yellow-400/10',
  fail: 'bg-red-400/10',
};

const checkIcons: Record<string, React.ElementType> = {
  'Required Sections': FileText,
  'Abstract Length (150-300 words)': MessageSquare,
  'References (min 15)': BookOpen,
  'Figures & Tables (min 2)': Image,
  'Authors (min 1)': Users,
  'Corresponding Author': Users,
  'Total Word Count': Hash,
  'Keywords (3-8)': Hash,
};

export default function SubmissionChecker() {
  const { submissionChecks, runSubmissionCheck } = useResearchStore();

  useEffect(() => {
    runSubmissionCheck();
  }, [runSubmissionCheck]);

  const passCount = submissionChecks.filter((c) => c.status === 'pass').length;
  const warnCount = submissionChecks.filter((c) => c.status === 'warn').length;
  const failCount = submissionChecks.filter((c) => c.status === 'fail').length;
  const total = submissionChecks.length;
  const readinessScore = total > 0 ? Math.round((passCount / total) * 100) : 0;

  return (
    <div
      className="h-full overflow-y-auto p-3 space-y-3"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={16} style={{ color: 'var(--primary)' }} />
          <h3 className="text-sm font-semibold">Submission Checker</h3>
        </div>
        <button
          onClick={runSubmissionCheck}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border opacity-60 hover:opacity-100"
          style={{ borderColor: 'var(--border)' }}
        >
          <RefreshCw size={10} /> Refresh
        </button>
      </div>

      {/* Readiness score */}
      <div
        className="rounded-lg p-3 border text-center"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <p className="text-xs opacity-50 mb-1">Submission Readiness</p>
        <p
          className={cn(
            'text-3xl font-bold',
            readinessScore >= 80 ? 'text-green-400' : readinessScore >= 50 ? 'text-yellow-400' : 'text-red-400'
          )}
        >
          {readinessScore}%
        </p>
        <div className="flex items-center justify-center gap-3 mt-2 text-[10px]">
          <span className="flex items-center gap-1 text-green-400">
            <CheckCircle2 size={10} /> {passCount} pass
          </span>
          <span className="flex items-center gap-1 text-yellow-400">
            <AlertTriangle size={10} /> {warnCount} warn
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <XCircle size={10} /> {failCount} fail
          </span>
        </div>
      </div>

      {/* Checks list */}
      <div className="space-y-1.5">
        {submissionChecks.map((check) => {
          const Icon = statusIcon[check.status];
          const CheckIcon = checkIcons[check.label] || FileText;
          return (
            <div
              key={check.id}
              className={cn(
                'rounded-lg p-2.5 border flex items-start gap-2.5',
                statusBg[check.status]
              )}
              style={{ borderColor: 'var(--border)' }}
            >
              <Icon size={14} className={cn('mt-0.5 shrink-0', statusColor[check.status])} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckIcon size={11} className="opacity-40" />
                  <p className="text-xs font-medium">{check.label}</p>
                </div>
                <p className="text-[10px] opacity-60 mt-0.5">{check.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {submissionChecks.length === 0 && (
        <div className="text-center py-8 text-xs opacity-40">
          <ClipboardCheck size={24} className="mx-auto mb-2 opacity-30" />
          Click Refresh to run checks
        </div>
      )}
    </div>
  );
}
