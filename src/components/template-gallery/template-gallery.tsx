'use client';

import { Search, X, Grid3X3, List, SortAsc, Plus, Sparkles } from 'lucide-react';
import { useTemplateGalleryStore, TEMPLATE_CATEGORIES } from '@/store/template-gallery-store';
import { CategorySidebar } from './category-sidebar';
import { TemplateGrid } from './template-grid';
import { TemplatePreviewModal } from './template-preview-modal';
import { SaveTemplateModal } from './save-template-modal';

export function TemplateGallery() {
  const {
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    sortBy, setSortBy,
    selectedCategory, selectedSubcategory,
    setShowSaveModal,
    getFilteredTemplates,
  } = useTemplateGalleryStore();

  const filtered = getFilteredTemplates();
  const currentCat = TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory);

  const getCategoryTitle = () => {
    if (!selectedCategory) return 'All Templates';
    if (selectedCategory === 'favorites') return 'Favorite Templates';
    if (selectedCategory === 'custom') return 'My Custom Templates';
    return currentCat?.name || 'Templates';
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <CategorySidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                <Sparkles size={18} className="inline-block mr-2 -mt-0.5" style={{ color: currentCat?.color || 'var(--primary)' }} />
                RachanaMandir — Template Gallery
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {TEMPLATE_CATEGORIES.length} categories &middot; {filtered.length} templates shown
              </p>
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus size={14} /> Save as Template
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by name, category, or tags..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--foreground)' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: 'var(--muted-foreground)' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <SortAsc size={13} style={{ color: 'var(--muted-foreground)' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'date' | 'popular')}
                className="rounded-lg border px-2 py-1.5 text-xs bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
                <option value="date">Newest First</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="rounded-md p-1.5"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                }}
              >
                <Grid3X3 size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="rounded-md p-1.5"
                style={{
                  backgroundColor: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                }}
              >
                <List size={13} />
              </button>
            </div>
          </div>

          {/* Active filters */}
          {(selectedCategory || selectedSubcategory || searchQuery) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Showing:</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${currentCat?.color || 'var(--primary)'}20`, color: currentCat?.color || 'var(--primary)' }}
              >
                {getCategoryTitle()}
              </span>
              {selectedSubcategory && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                  {selectedSubcategory}
                </span>
              )}
              {searchQuery && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                  &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              <span className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
                ({filtered.length} results)
              </span>
            </div>
          )}
        </div>

        {/* Template Grid */}
        <TemplateGrid />
      </div>

      {/* Modals */}
      <TemplatePreviewModal />
      <SaveTemplateModal />
    </div>
  );
}
