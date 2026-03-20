'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  SpellCheck, Loader2, Check, X, Plus, BookOpen,
  ToggleLeft, ToggleRight, AlertCircle, Type, Pencil,
} from 'lucide-react';

export default function SpellingPanel() {
  const {
    spellingIssues, spellingEnabled, autoCorrectEnabled, customDictionary,
    runSpellingCheck, toggleSpelling, toggleAutoCorrect,
    addToCustomDictionary, dismissSpellingIssue, applySpellingSuggestion,
    sections,
  } = useResearchStore();

  const [checking, setChecking] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [showDict, setShowDict] = useState(false);

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      runSpellingCheck();
      setChecking(false);
    }, 1200);
  };

  const spellingCount = spellingIssues.filter((i) => i.type === 'spelling').length;
  const grammarCount = spellingIssues.filter((i) => i.type === 'grammar').length;

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--foreground)' }}>
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <SpellCheck size={14} style={{ color: 'var(--primary)' }} />
          <h3 className="text-xs font-semibold">Spelling & Grammar</h3>
        </div>

        <button
          onClick={handleCheck}
          disabled={checking}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded font-medium disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {checking ? (
            <><Loader2 size={14} className="animate-spin" /> Checking...</>
          ) : (
            <><SpellCheck size={14} /> Run Check</>
          )}
        </button>

        {/* Toggles */}
        <div className="mt-3 space-y-2">
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="opacity-70">Spell check</span>
            <button onClick={() => toggleSpelling(!spellingEnabled)}>
              {spellingEnabled ? (
                <ToggleRight size={20} style={{ color: 'var(--primary)' }} />
              ) : (
                <ToggleLeft size={20} className="opacity-40" />
              )}
            </button>
          </label>
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="opacity-70">Auto-correct</span>
            <button onClick={() => toggleAutoCorrect(!autoCorrectEnabled)}>
              {autoCorrectEnabled ? (
                <ToggleRight size={20} style={{ color: 'var(--primary)' }} />
              ) : (
                <ToggleLeft size={20} className="opacity-40" />
              )}
            </button>
          </label>
        </div>
      </div>

      {/* Stats */}
      {spellingIssues.length > 0 && (
        <div className="flex gap-2 p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1 rounded-lg p-2 text-center" style={{ backgroundColor: 'var(--background)' }}>
            <p className="text-lg font-bold text-red-400">{spellingCount}</p>
            <p className="text-[10px] opacity-50">Spelling</p>
          </div>
          <div className="flex-1 rounded-lg p-2 text-center" style={{ backgroundColor: 'var(--background)' }}>
            <p className="text-lg font-bold text-blue-400">{grammarCount}</p>
            <p className="text-[10px] opacity-50">Grammar</p>
          </div>
        </div>
      )}

      {/* Issue list */}
      <div className="flex-1 overflow-y-auto">
        {spellingIssues.map((issue) => {
          const section = sections.find((s) => s.id === issue.sectionId);
          return (
            <div key={issue.id} className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-2 mb-1.5">
                {issue.type === 'spelling' ? (
                  <Type size={12} className="text-red-400 mt-0.5 shrink-0" />
                ) : (
                  <Pencil size={12} className="text-blue-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className={cn('font-medium', issue.type === 'spelling' ? 'text-red-400' : 'text-blue-400')}>
                      {issue.word}
                    </span>
                    <span className="opacity-40 ml-1 text-[10px]">in {section?.title || 'Unknown'}</span>
                  </p>
                  {issue.rule && (
                    <p className="text-[10px] opacity-50 mt-0.5 italic">{issue.rule}</p>
                  )}
                </div>
                <button
                  onClick={() => dismissSpellingIssue(issue.id)}
                  className="shrink-0 opacity-40 hover:opacity-100"
                  title="Dismiss"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 ml-5">
                {issue.suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => applySpellingSuggestion(issue.id, sug)}
                    className="text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 hover:opacity-80"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                  >
                    <Check size={8} className="text-green-400" />
                    {sug}
                  </button>
                ))}
                {issue.type === 'spelling' && (
                  <button
                    onClick={() => addToCustomDictionary(issue.word)}
                    className="text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 opacity-50 hover:opacity-80"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <Plus size={8} /> Dictionary
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {spellingIssues.length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 opacity-40">
            <AlertCircle size={24} className="mb-2" />
            <p className="text-xs text-center">
              {checking ? 'Checking...' : 'Run a check to find spelling and grammar issues'}
            </p>
          </div>
        )}
      </div>

      {/* Custom dictionary */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setShowDict(!showDict)}
          className="w-full flex items-center gap-2 text-xs p-2 opacity-60 hover:opacity-100"
        >
          <BookOpen size={12} /> Custom Dictionary ({customDictionary.length})
        </button>
        {showDict && (
          <div className="px-3 pb-3 space-y-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Add word..."
                className="flex-1 text-xs px-2 py-1 rounded border"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                onKeyDown={(e) => { if (e.key === 'Enter' && newWord) { addToCustomDictionary(newWord); setNewWord(''); } }}
              />
              <button
                onClick={() => { if (newWord) { addToCustomDictionary(newWord); setNewWord(''); } }}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Add
              </button>
            </div>
            {customDictionary.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {customDictionary.map((w) => (
                  <span key={w} className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--background)' }}>
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
