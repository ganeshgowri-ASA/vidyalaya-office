'use client';

import { useState } from 'react';
import {
  GitBranch, Network, Box, Home, Users, Brain, Workflow, Database,
  Smartphone, BarChart3, GanttChart, ArrowRightLeft, Circle, Rows3,
  ArrowDownUp, Map, ListOrdered, ToggleRight, Building2, Cloud,
  Boxes, HardDrive, Globe, MousePointerClick, Columns3, Route,
  TreeDeciduous, Fish, Grid2X2, LayoutPanelTop, Footprints, Layers,
  SquareStack, ShieldAlert, Server, Zap, Pipette, Armchair, DoorOpen,
  Building, Filter, Clock, Waypoints, ClipboardList, AlertTriangle,
  BarChart, Container, Plug, Compass, UsersRound, LayoutList,
  BookOpen, TreePine, Flower2, PartyPopper, Grid3X3, Scale, Cpu,
  GitPullRequest, Palette, Radar, Link, Wifi, RefreshCcw, Gauge,
  Truck, Megaphone, StickyNote, Repeat, Heart, FolderPlus,
  ChevronDown, ChevronRight, Star, Search,
} from 'lucide-react';
import { TEMPLATE_CATEGORIES, useTemplateGalleryStore } from '@/store/template-gallery-store';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  GitBranch, Network, Box, Home, Users, Brain, Workflow, Database,
  Smartphone, BarChart3, GanttChart, ArrowRightLeft, Circle, Rows3,
  ArrowDownUp, Map, ListOrdered, ToggleRight, Building2, Cloud,
  Boxes, HardDrive, Globe, MousePointerClick, Columns3, Route,
  TreeDeciduous, Fish, Grid2X2, LayoutPanelTop, Footprints, Layers,
  SquareStack, ShieldAlert, Server, Zap, Pipette, Armchair, DoorOpen,
  Building, Filter, Clock, Waypoints, ClipboardList, AlertTriangle,
  BarChart, Container, Plug, Compass, UsersRound, LayoutList,
  BookOpen, TreePine, Flower2, PartyPopper, Grid3X3, Scale, Cpu,
  GitPullRequest, Palette, Radar, Link, Wifi, RefreshCcw, Gauge,
  Truck, Megaphone, Sticky: StickyNote, Repeat,
};

export function CategorySidebar() {
  const { selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory, favoriteIds, customTemplates } = useTemplateGalleryStore();
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const toggleExpand = (catId: string) => {
    setExpandedCats(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const filteredCategories = sidebarSearch
    ? TEMPLATE_CATEGORIES.filter(c => c.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
    : TEMPLATE_CATEGORIES;

  return (
    <div
      className="flex h-full w-64 shrink-0 flex-col border-r overflow-hidden"
      style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }}
    >
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--sidebar-foreground)' }}>
          Categories
        </h2>
        <div
          className="flex items-center gap-2 rounded-lg border px-2 py-1.5"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
        >
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Filter categories..."
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Special categories */}
        <button
          onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}
          className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors')}
          style={{
            backgroundColor: selectedCategory === null ? 'var(--sidebar-accent)' : 'transparent',
            color: selectedCategory === null ? 'var(--primary-foreground)' : 'var(--sidebar-foreground)',
            opacity: selectedCategory === null ? 1 : 0.7,
          }}
        >
          <Grid3X3 size={14} />
          <span>All Templates</span>
        </button>

        <button
          onClick={() => { setSelectedCategory('favorites'); setSelectedSubcategory(null); }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          style={{
            backgroundColor: selectedCategory === 'favorites' ? 'var(--sidebar-accent)' : 'transparent',
            color: selectedCategory === 'favorites' ? 'var(--primary-foreground)' : 'var(--sidebar-foreground)',
            opacity: selectedCategory === 'favorites' ? 1 : 0.7,
          }}
        >
          <Heart size={14} />
          <span>Favorites</span>
          {favoriteIds.length > 0 && (
            <span className="ml-auto text-[10px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {favoriteIds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setSelectedCategory('custom'); setSelectedSubcategory(null); }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          style={{
            backgroundColor: selectedCategory === 'custom' ? 'var(--sidebar-accent)' : 'transparent',
            color: selectedCategory === 'custom' ? 'var(--primary-foreground)' : 'var(--sidebar-foreground)',
            opacity: selectedCategory === 'custom' ? 1 : 0.7,
          }}
        >
          <FolderPlus size={14} />
          <span>My Templates</span>
          {customTemplates.length > 0 && (
            <span className="ml-auto text-[10px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {customTemplates.length}
            </span>
          )}
        </button>

        <div className="mx-2 my-2 border-t" style={{ borderColor: 'var(--border)', opacity: 0.3 }} />

        {/* Category list */}
        {filteredCategories.map((cat) => {
          const IconComp = ICON_MAP[cat.icon] || Box;
          const isSelected = selectedCategory === cat.id;
          const isExpanded = expandedCats.includes(cat.id);

          return (
            <div key={cat.id}>
              <div className="flex items-center">
                <button
                  onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(null); }}
                  className={cn('flex flex-1 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors')}
                  style={{
                    backgroundColor: isSelected ? `${cat.color}20` : 'transparent',
                    color: isSelected ? cat.color : 'var(--sidebar-foreground)',
                    opacity: isSelected ? 1 : 0.7,
                  }}
                >
                  <IconComp size={13} />
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-auto text-[10px] opacity-50">{cat.count}</span>
                </button>
                {cat.subcategories.length > 0 && (
                  <button
                    onClick={() => toggleExpand(cat.id)}
                    className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="ml-6 space-y-0.5 mt-0.5">
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(sub); }}
                      className="flex w-full items-center rounded-md px-2 py-1 text-[11px] transition-colors"
                      style={{
                        backgroundColor: selectedCategory === cat.id && selectedSubcategory === sub ? `${cat.color}15` : 'transparent',
                        color: selectedCategory === cat.id && selectedSubcategory === sub ? cat.color : 'var(--muted-foreground)',
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
          {TEMPLATE_CATEGORIES.length} categories &middot; {filteredCategories.reduce((s, c) => s + c.count, 0)}+ templates
        </div>
      </div>
    </div>
  );
}
