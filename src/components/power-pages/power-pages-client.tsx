'use client';

import { useState } from 'react';
import {
  Globe, Plus, Search, Eye, Edit3, Settings, Users, BarChart3,
  ChevronRight, ExternalLink, X, ArrowLeft, Layout, Type, Image,
  FileText, List, CreditCard, Navigation, MessageSquare, HelpCircle,
  Table, Video, Trash2, GripVertical, PanelTop, BookOpen, Calendar,
  Building, UserCircle, MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePowerPagesStore, PowerSite, SitePage, WebPart } from '@/store/power-pages-store';

const webPartIcons: Record<string, React.ElementType> = {
  hero: PanelTop,
  text: Type,
  image: Image,
  form: FileText,
  list: List,
  cards: CreditCard,
  nav: Navigation,
  footer: Layout,
  faq: HelpCircle,
  cta: MessageSquare,
  table: Table,
  video: Video,
};

const templateIcons: Record<string, React.ElementType> = {
  users: Users,
  building: Building,
  bookOpen: BookOpen,
  calendar: Calendar,
  handshake: UserCircle,
  messageCircle: MessageCircle,
};

function WebPartRenderer({ part }: { part: WebPart }) {
  if (part.type === 'hero') {
    return (
      <div className="rounded-lg p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--sidebar-accent), #7c3aed)' }}>
        <h2 className="text-2xl font-bold text-white mb-2">{part.content.title}</h2>
        {part.content.subtitle && <p className="text-sm text-white/80 mb-4">{part.content.subtitle}</p>}
        {part.content.buttonText && (
          <button className="px-5 py-2 rounded-lg text-sm font-medium bg-white text-gray-900">{part.content.buttonText}</button>
        )}
      </div>
    );
  }
  if (part.type === 'cards') {
    const cards = Object.entries(part.content).filter(([k]) => k.startsWith('card'));
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(([key, val]) => (
          <div key={key} className="rounded-lg border p-4 text-center cursor-pointer hover:border-opacity-60 transition" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'var(--sidebar-accent)' + '20' }}>
              <CreditCard size={18} style={{ color: 'var(--sidebar-accent)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{val}</p>
          </div>
        ))}
      </div>
    );
  }
  if (part.type === 'text') {
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--card)' }}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{part.content.text}</p>
      </div>
    );
  }
  if (part.type === 'form') {
    const fields = part.content.fields?.split(',') ?? [];
    return (
      <div className="rounded-lg border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="font-medium text-sm mb-4" style={{ color: 'var(--foreground)' }}>{part.label}</h3>
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field}>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>{field.trim()}</label>
              {field.trim() === 'Message' ? (
                <textarea className="w-full px-3 py-2 rounded border text-sm resize-none" rows={3} style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} placeholder={`Enter ${field.trim().toLowerCase()}...`} />
              ) : (
                <input className="w-full px-3 py-2 rounded border text-sm" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} placeholder={`Enter ${field.trim().toLowerCase()}...`} />
              )}
            </div>
          ))}
          <button className="px-4 py-2 rounded text-sm font-medium" style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}>Submit</button>
        </div>
      </div>
    );
  }
  if (part.type === 'faq') {
    const faqs = Object.entries(part.content).filter(([k]) => k.startsWith('q'));
    return (
      <div className="rounded-lg border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="font-medium text-sm mb-3" style={{ color: 'var(--foreground)' }}>Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map(([key, question]) => {
            const ansKey = key.replace('q', 'a');
            const answer = part.content[ansKey];
            return (
              <div key={key} className="rounded p-3" style={{ backgroundColor: 'var(--background)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>{question}</p>
                {answer && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (part.type === 'list') {
    const items = Object.entries(part.content).filter(([k]) => k.startsWith('item'));
    return (
      <div className="rounded-lg border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="font-medium text-sm mb-3" style={{ color: 'var(--foreground)' }}>{part.label}</h3>
        <div className="space-y-2">
          {items.map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 px-3 py-2 rounded" style={{ backgroundColor: 'var(--background)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sidebar-accent)' }} />
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (part.type === 'footer') {
    return (
      <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'var(--card)' }}>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{part.content.copyright}</p>
        {part.content.links && <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{part.content.links}</p>}
      </div>
    );
  }
  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>[{part.type}: {part.label}]</p>
    </div>
  );
}

function PageEditor() {
  const { editorSite, setEditorSite, activePageId, setActivePageId, selectedWebPartId, setSelectedWebPartId, addWebPart, removeWebPart, togglePagePublished, addPage } = usePowerPagesStore();

  if (!editorSite) return null;

  const activePage = editorSite.pages.find((p) => p.id === activePageId);

  const handleAddWebPart = (type: WebPart['type']) => {
    if (!activePageId) return;
    const part: WebPart = {
      id: `wp-${Date.now()}`,
      type,
      label: `New ${type}`,
      content: type === 'hero' ? { title: 'New Section', subtitle: 'Add your content here' } : { text: 'New content block' },
      order: activePage?.webParts.length ?? 0,
    };
    addWebPart(activePageId, part);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditorSite(null)} className="p-1 rounded" style={{ color: 'var(--foreground)' }}><ArrowLeft size={18} /></button>
          <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>{editorSite.name}</h2>
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--sidebar-accent)' + '20', color: 'var(--sidebar-accent)' }}>{editorSite.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' }}>
            <Globe size={14} /> Publish
          </button>
          <button className="px-3 py-1.5 rounded text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <Settings size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Pages sidebar */}
        <div className="w-48 border-r overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Pages</p>
          </div>
          {editorSite.pages.map((pg) => (
            <button
              key={pg.id}
              onClick={() => setActivePageId(pg.id)}
              className={cn('w-full text-left px-3 py-2.5 text-sm border-b flex items-center justify-between')}
              style={{
                borderColor: 'var(--border)',
                backgroundColor: activePageId === pg.id ? 'var(--sidebar-accent)' + '20' : 'transparent',
                color: activePageId === pg.id ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              <span>{pg.title}</span>
              <div className="flex items-center gap-1">
                {pg.published && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />}
              </div>
            </button>
          ))}
          <button
            onClick={() => addPage({
              id: `pg-${Date.now()}`,
              title: `Page ${editorSite.pages.length + 1}`,
              slug: `/page-${editorSite.pages.length + 1}`,
              webParts: [],
              published: false,
              lastModified: new Date().toISOString(),
            })}
            className="w-full flex items-center gap-1.5 px-3 py-2.5 text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Plus size={14} /> Add Page
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activePage && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{activePage.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePagePublished(activePage.id)}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: activePage.published ? '#10b98120' : 'var(--card)',
                      color: activePage.published ? '#10b981' : 'var(--muted-foreground)',
                      border: activePage.published ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {activePage.published ? 'Published' : 'Draft'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {activePage.webParts
                  .sort((a, b) => a.order - b.order)
                  .map((part) => (
                    <div
                      key={part.id}
                      className={cn('relative group rounded-lg')}
                      style={{ boxShadow: selectedWebPartId === part.id ? '0 0 0 2px var(--sidebar-accent)' : 'none' }}
                      onClick={() => setSelectedWebPartId(part.id)}
                    >
                      <WebPartRenderer part={part} />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 rounded" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
                          <GripVertical size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeWebPart(activePage.id, part.id); }}
                          className="p-1 rounded" style={{ backgroundColor: '#ef4444', color: 'white' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add web part */}
              <div className="mt-6 p-4 rounded-lg border border-dashed" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>Add Web Part</p>
                <div className="flex flex-wrap gap-2">
                  {(['hero', 'text', 'cards', 'form', 'list', 'faq', 'image', 'footer'] as const).map((type) => {
                    const Icon = webPartIcons[type] ?? Layout;
                    return (
                      <button
                        key={type}
                        onClick={() => handleAddWebPart(type)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs capitalize"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
                      >
                        <Icon size={13} /> {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings panel */}
        <div className="w-60 border-l overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Site Settings</p>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Domain</label>
              <p className="text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>{editorSite.domain}</p>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Theme</label>
              <p className="text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>{editorSite.theme}</p>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Visitors</label>
              <p className="text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>{editorSite.visitors.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Created</label>
              <p className="text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>{new Date(editorSite.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteCard({ site }: { site: PowerSite }) {
  const { setEditorSite } = usePowerPagesStore();
  const statusColors: Record<string, string> = {
    published: '#10b981',
    draft: '#f59e0b',
    maintenance: '#ef4444',
  };

  return (
    <div
      className="rounded-lg border p-4 cursor-pointer hover:border-opacity-60 transition-colors"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      onClick={() => setEditorSite(site)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#0ea5e920' }}>
          <Globe size={20} style={{ color: '#0ea5e9' }} />
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: statusColors[site.status] + '20', color: statusColors[site.status] }}>
          {site.status}
        </span>
      </div>
      <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--foreground)' }}>{site.name}</h3>
      <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{site.description}</p>
      <div className="flex items-center gap-1 text-xs mb-3" style={{ color: 'var(--sidebar-accent)' }}>
        <ExternalLink size={12} /> {site.domain}
      </div>
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><FileText size={12} /> {site.pages.length} pages</span>
          <span className="flex items-center gap-1"><Users size={12} /> {site.visitors}</span>
        </div>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}

export function PowerPagesClient() {
  const { sites, templates, activeView, setActiveView, searchQuery, setSearchQuery, editorSite } = usePowerPagesStore();

  if (activeView === 'editor' && editorSite) {
    return <PageEditor />;
  }

  const filteredSites = sites.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#0ea5e9' }}>
            <Globe size={20} color="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Power Pages</h1>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>External portal builder</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#0ea5e9', color: 'white' }}
          onClick={() => setActiveView('templates')}
        >
          <Plus size={16} /> New Site
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { key: 'sites' as const, label: 'My Sites', icon: Globe },
          { key: 'templates' as const, label: 'Templates', icon: Layout },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px"
            style={{
              borderColor: activeView === tab.key ? '#0ea5e9' : 'transparent',
              color: activeView === tab.key ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeView === 'sites' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  placeholder="Search sites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSites.map((site) => (
                <SiteCard key={site.id} site={site} />
              ))}
            </div>
          </div>
        )}

        {activeView === 'templates' && (
          <div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Site Templates</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Choose a template to get started quickly.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map((tmpl) => {
                const Icon = templateIcons[tmpl.icon] ?? Globe;
                return (
                  <div
                    key={tmpl.id}
                    className="rounded-lg border p-5 cursor-pointer hover:border-opacity-60 transition-colors"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                  >
                    <div className="p-3 rounded-lg w-fit mb-3" style={{ backgroundColor: '#0ea5e920' }}>
                      <Icon size={24} style={{ color: '#0ea5e9' }} />
                    </div>
                    <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--foreground)' }}>{tmpl.name}</h3>
                    <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{tmpl.description}</p>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>{tmpl.category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
