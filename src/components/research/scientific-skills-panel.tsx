'use client';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Search, ChevronDown, ChevronUp, Plus, Grid, List,
  FlaskConical, Beaker, Star, Filter, X, ExternalLink,
  BookOpen, Tag, Sparkles, CheckCircle2,
} from 'lucide-react';
import { scientificSkills, skillCategories } from '@/lib/data/scientific-skills-data';
import type { ScientificSkill } from '@/lib/data/scientific-skills-data';

type ViewMode = 'grid' | 'list';
type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

const difficultyColors: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#3b82f6',
  advanced: '#f59e0b',
  expert: '#ef4444',
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export default function ScientificSkillsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const filteredSkills = useMemo(() => {
    return scientificSkills.filter(skill => {
      const matchesSearch = !searchQuery ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || skill.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleAddSkill = useCallback((skillId: string) => {
    setAddedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  }, []);

  const getCategoryColor = (categoryId: string) => {
    return skillCategories.find(c => c.id === categoryId)?.color || '#6b7280';
  };

  const getCategoryName = (categoryId: string) => {
    return skillCategories.find(c => c.id === categoryId)?.name || categoryId;
  };

  const getRelatedSkillNames = (relatedIds: string[]) => {
    return relatedIds
      .map(id => scientificSkills.find(s => s.id === id))
      .filter(Boolean)
      .map(s => s!.name);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Beaker size={16} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold">Scientific Skills</span>
          <span className="text-[10px] opacity-40">{scientificSkills.length} skills</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
            title={viewMode === 'grid' ? 'List view' : 'Grid view'}
          >
            {viewMode === 'grid' ? <List size={14} /> : <Grid size={14} />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('p-1 rounded transition-opacity', showFilters ? 'opacity-100' : 'opacity-50 hover:opacity-100')}
            style={showFilters ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
            title="Toggle filters"
          >
            <Filter size={14} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded"
          style={{ backgroundColor: 'var(--sidebar)', border: '1px solid var(--border)' }}
        >
          <Search size={13} className="opacity-40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search skills, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs outline-none placeholder-opacity-40"
            style={{ color: 'var(--foreground)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="opacity-40 hover:opacity-100">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-3 py-2 border-b space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
          {/* Category filter */}
          <div>
            <span className="text-[10px] uppercase tracking-wider opacity-50 font-medium">Category</span>
            <div className="flex flex-wrap gap-1 mt-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn('px-2 py-0.5 rounded-full text-[10px] transition-colors border', selectedCategory === 'all' ? 'opacity-100' : 'opacity-50 hover:opacity-80')}
                style={{
                  borderColor: selectedCategory === 'all' ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: selectedCategory === 'all' ? 'var(--sidebar-accent)' : 'transparent',
                }}
              >
                All
              </button>
              {skillCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                  className={cn('px-2 py-0.5 rounded-full text-[10px] transition-colors border', selectedCategory === cat.id ? 'opacity-100' : 'opacity-50 hover:opacity-80')}
                  style={{
                    borderColor: selectedCategory === cat.id ? cat.color : 'var(--border)',
                    backgroundColor: selectedCategory === cat.id ? `${cat.color}20` : 'transparent',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <span className="text-[10px] uppercase tracking-wider opacity-50 font-medium">Difficulty</span>
            <div className="flex gap-1 mt-1">
              {(['all', 'beginner', 'intermediate', 'advanced', 'expert'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn('px-2 py-0.5 rounded-full text-[10px] transition-colors border capitalize', selectedDifficulty === diff ? 'opacity-100' : 'opacity-50 hover:opacity-80')}
                  style={{
                    borderColor: selectedDifficulty === diff ? (diff === 'all' ? 'var(--primary)' : difficultyColors[diff]) : 'var(--border)',
                    backgroundColor: selectedDifficulty === diff ? (diff === 'all' ? 'var(--sidebar-accent)' : `${difficultyColors[diff]}20`) : 'transparent',
                  }}
                >
                  {diff === 'all' ? 'All' : difficultyLabels[diff]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Added skills summary */}
      {addedSkills.size > 0 && (
        <div className="px-3 py-1.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
          <CheckCircle2 size={12} style={{ color: '#22c55e' }} />
          <span className="text-[10px]">{addedSkills.size} skills added to project</span>
          <button
            onClick={() => setAddedSkills(new Set())}
            className="text-[10px] opacity-40 hover:opacity-70 ml-auto"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Skills List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-40">
            <FlaskConical size={32} className="mb-3" />
            <p className="text-xs text-center">No skills match your search.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedDifficulty('all'); }}
              className="text-[10px] mt-2 underline opacity-70 hover:opacity-100"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className={cn(viewMode === 'grid' ? 'grid grid-cols-2 gap-1.5' : 'space-y-1.5')}>
            {filteredSkills.map(skill => {
              const isExpanded = expandedSkill === skill.id;
              const isAdded = addedSkills.has(skill.id);
              const catColor = getCategoryColor(skill.category);

              return (
                <div
                  key={skill.id}
                  className={cn(
                    'rounded-lg border transition-all cursor-pointer',
                    isExpanded ? 'col-span-2' : '',
                    isAdded ? 'ring-1' : ''
                  )}
                  style={{
                    borderColor: isAdded ? '#22c55e' : 'var(--border)',
                    backgroundColor: 'var(--sidebar)',
                  }}
                  onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                >
                  <div className="p-2">
                    <div className="flex items-start gap-1.5">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${catColor}20`, color: catColor }}
                      >
                        <FlaskConical size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-medium truncate">{skill.name}</span>
                          {isAdded && <CheckCircle2 size={10} style={{ color: '#22c55e' }} />}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className="text-[8px] px-1 py-0 rounded-full"
                            style={{ backgroundColor: `${catColor}20`, color: catColor }}
                          >
                            {getCategoryName(skill.category)}
                          </span>
                          <span
                            className="text-[8px] px-1 py-0 rounded-full"
                            style={{ backgroundColor: `${difficultyColors[skill.difficulty]}20`, color: difficultyColors[skill.difficulty] }}
                          >
                            {difficultyLabels[skill.difficulty]}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={12} className="opacity-40" /> : <ChevronDown size={12} className="opacity-40" />}
                    </div>

                    {!isExpanded && viewMode === 'list' && (
                      <p className="text-[10px] opacity-60 mt-1 line-clamp-1 ml-7">{skill.description}</p>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-2 pb-2 space-y-2 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-[11px] opacity-70 leading-relaxed">{skill.description}</p>

                      {/* Tags */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag size={10} className="opacity-40" />
                        {skill.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Related Skills */}
                      {skill.relatedSkills.length > 0 && (
                        <div>
                          <span className="text-[10px] opacity-50 flex items-center gap-1 mb-1">
                            <ExternalLink size={9} /> Related Skills
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {getRelatedSkillNames(skill.relatedSkills).map(name => (
                              <span
                                key={name}
                                className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80"
                                style={{ backgroundColor: 'var(--sidebar-accent)' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchQuery(name);
                                }}
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add to Project button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSkill(skill.id);
                        }}
                        className={cn(
                          'w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-medium transition-all',
                          isAdded ? 'opacity-80' : 'hover:opacity-90'
                        )}
                        style={{
                          backgroundColor: isAdded ? '#22c55e20' : 'var(--primary)',
                          color: isAdded ? '#22c55e' : '#fff',
                          border: isAdded ? '1px solid #22c55e40' : 'none',
                        }}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 size={11} /> Added to Project
                          </>
                        ) : (
                          <>
                            <Plus size={11} /> Add to Project
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-t text-[10px] opacity-40"
        style={{ borderColor: 'var(--border)' }}
      >
        <span>{filteredSkills.length} of {scientificSkills.length} skills</span>
        <span>{skillCategories.length} categories</span>
      </div>
    </div>
  );
}
