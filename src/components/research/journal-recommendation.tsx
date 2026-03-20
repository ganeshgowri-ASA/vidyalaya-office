'use client';
import { useEffect } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  BookOpen, RefreshCw, Star, ArrowRight, Tag,
} from 'lucide-react';

export default function JournalRecommendation() {
  const {
    journalRecommendations, recommendJournals, applyTemplate,
    setShowTemplateGallery,
  } = useResearchStore();

  useEffect(() => {
    recommendJournals();
  }, [recommendJournals]);

  return (
    <div
      className="h-full overflow-y-auto p-3 space-y-3"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} style={{ color: 'var(--primary)' }} />
          <h3 className="text-sm font-semibold">Journal Match</h3>
        </div>
        <button
          onClick={recommendJournals}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border opacity-60 hover:opacity-100"
          style={{ borderColor: 'var(--border)' }}
        >
          <RefreshCw size={10} /> Refresh
        </button>
      </div>

      <p className="text-[10px] opacity-50">
        Based on your abstract and keywords, these journals are the best match for your manuscript.
      </p>

      {/* Recommendations */}
      <div className="space-y-2">
        {journalRecommendations.map((rec, index) => (
          <div
            key={rec.templateId}
            className="rounded-lg p-2.5 border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-start gap-2">
              {/* Rank */}
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                  index === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-300/20 text-gray-300' :
                  index === 2 ? 'bg-orange-400/20 text-orange-400' :
                  'bg-white/5 opacity-50'
                )}
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold truncate">{rec.name}</p>
                  {index < 3 && <Star size={10} className="text-yellow-400 shrink-0" fill="currentColor" />}
                </div>
                <p className="text-[10px] opacity-40 mt-0.5">{rec.category}</p>

                {/* Match score bar */}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        rec.matchScore >= 70 ? 'bg-green-400' :
                        rec.matchScore >= 40 ? 'bg-yellow-400' :
                        'bg-orange-400'
                      )}
                      style={{ width: `${rec.matchScore}%` }}
                    />
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold',
                    rec.matchScore >= 70 ? 'text-green-400' :
                    rec.matchScore >= 40 ? 'text-yellow-400' :
                    'text-orange-400'
                  )}>
                    {rec.matchScore}%
                  </span>
                </div>

                {/* Matched keywords */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {rec.reasons.slice(0, 3).map((reason) => (
                    <span
                      key={reason}
                      className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ backgroundColor: 'var(--background)' }}
                    >
                      <Tag size={7} className="opacity-40" />
                      <span className="opacity-60">{reason}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Use template button */}
              <button
                onClick={() => applyTemplate(rec.templateId)}
                className="shrink-0 p-1.5 rounded opacity-40 hover:opacity-80 transition-opacity"
                title="Apply this template"
              >
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {journalRecommendations.length === 0 && (
        <div className="text-center py-8 text-xs opacity-40">
          <BookOpen size={24} className="mx-auto mb-2 opacity-30" />
          No recommendations yet. Add content to your abstract and keywords.
        </div>
      )}

      <button
        onClick={() => setShowTemplateGallery(true)}
        className="w-full text-xs px-3 py-2 rounded-lg border opacity-60 hover:opacity-100 text-center"
        style={{ borderColor: 'var(--border)' }}
      >
        Browse All Templates
      </button>
    </div>
  );
}
