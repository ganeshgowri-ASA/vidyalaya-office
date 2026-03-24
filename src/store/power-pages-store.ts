'use client';
import { create } from 'zustand';

export interface WebPart {
  id: string;
  type: 'hero' | 'text' | 'image' | 'form' | 'list' | 'cards' | 'nav' | 'footer' | 'faq' | 'cta' | 'table' | 'video';
  label: string;
  content: Record<string, string>;
  order: number;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  webParts: WebPart[];
  published: boolean;
  lastModified: string;
}

export interface PowerSite {
  id: string;
  name: string;
  description: string;
  template: string;
  domain: string;
  status: 'published' | 'draft' | 'maintenance';
  pages: SitePage[];
  createdAt: string;
  visitors: number;
  theme: string;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  previewParts: WebPart[];
}

interface PowerPagesState {
  sites: PowerSite[];
  templates: PageTemplate[];
  activeView: 'sites' | 'editor' | 'settings' | 'templates';
  selectedSiteId: string | null;
  editorSite: PowerSite | null;
  activePageId: string | null;
  selectedWebPartId: string | null;
  editingWebPartId: string | null;
  searchQuery: string;
  showPageSettings: boolean;
  pageSettingsTab: 'seo' | 'permissions' | 'css';

  setActiveView: (view: PowerPagesState['activeView']) => void;
  setSelectedSiteId: (id: string | null) => void;
  setEditorSite: (site: PowerSite | null) => void;
  setActivePageId: (id: string | null) => void;
  setSelectedWebPartId: (id: string | null) => void;
  setEditingWebPartId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setShowPageSettings: (show: boolean) => void;
  setPageSettingsTab: (tab: 'seo' | 'permissions' | 'css') => void;
  addWebPart: (pageId: string, part: WebPart) => void;
  removeWebPart: (pageId: string, partId: string) => void;
  updateWebPart: (pageId: string, partId: string, updates: Partial<WebPart>) => void;
  insertWebPartAfter: (pageId: string, afterPartId: string, part: WebPart) => void;
  addPage: (page: SitePage) => void;
  deletePage: (pageId: string) => void;
  togglePagePublished: (pageId: string) => void;
}

const sampleSites: PowerSite[] = [
  {
    id: 'site-1',
    name: 'Customer Portal',
    description: 'Self-service portal for customers to manage accounts and submit requests',
    template: 'Customer Portal',
    domain: 'customers.company.com',
    status: 'published',
    visitors: 1240,
    theme: 'Professional Blue',
    createdAt: '2026-01-10T08:00:00Z',
    pages: [
      {
        id: 'pg-1',
        title: 'Home',
        slug: '/',
        published: true,
        lastModified: '2026-03-20T10:00:00Z',
        webParts: [
          { id: 'wp1', type: 'hero', label: 'Hero Banner', content: { title: 'Welcome to Your Portal', subtitle: 'Manage your account, track orders, and get support', buttonText: 'Get Started' }, order: 0 },
          { id: 'wp2', type: 'cards', label: 'Quick Links', content: { card1: 'My Account', card2: 'Submit Request', card3: 'Knowledge Base', card4: 'Contact Us' }, order: 1 },
          { id: 'wp3', type: 'text', label: 'Welcome Message', content: { text: 'Access all your services in one place. Our portal gives you 24/7 access to manage your account.' }, order: 2 },
          { id: 'wp4', type: 'footer', label: 'Footer', content: { copyright: '© 2026 Company Inc.', links: 'Privacy Policy | Terms of Service' }, order: 3 },
        ],
      },
      {
        id: 'pg-2',
        title: 'Support',
        slug: '/support',
        published: true,
        lastModified: '2026-03-18T14:00:00Z',
        webParts: [
          { id: 'wp5', type: 'text', label: 'Support Header', content: { text: 'How can we help you today?' }, order: 0 },
          { id: 'wp6', type: 'form', label: 'Support Form', content: { fields: 'Name,Email,Subject,Message' }, order: 1 },
          { id: 'wp7', type: 'faq', label: 'FAQ Section', content: { q1: 'How do I reset my password?', a1: 'Click Forgot Password on the login page.', q2: 'How do I track my order?', a2: 'Go to My Account > Orders.' }, order: 2 },
        ],
      },
    ],
  },
  {
    id: 'site-2',
    name: 'Employee Self-Service',
    description: 'Internal portal for HR services, pay stubs, and benefits enrollment',
    template: 'Employee Self-Service',
    domain: 'hr.company.internal',
    status: 'published',
    visitors: 890,
    theme: 'Modern Dark',
    createdAt: '2026-02-01T09:00:00Z',
    pages: [
      {
        id: 'pg-3',
        title: 'Dashboard',
        slug: '/',
        published: true,
        lastModified: '2026-03-22T11:00:00Z',
        webParts: [
          { id: 'wp8', type: 'hero', label: 'Welcome', content: { title: 'Employee Hub', subtitle: 'Your one-stop shop for HR services' }, order: 0 },
          { id: 'wp9', type: 'cards', label: 'Services', content: { card1: 'Pay Stubs', card2: 'Benefits', card3: 'Time Off', card4: 'Directory' }, order: 1 },
          { id: 'wp10', type: 'list', label: 'Announcements', content: { item1: 'Open enrollment starts April 1', item2: 'New wellness program available', item3: 'Q1 town hall recording posted' }, order: 2 },
        ],
      },
    ],
  },
  {
    id: 'site-3',
    name: 'Knowledge Base',
    description: 'Searchable knowledge base with articles, guides, and documentation',
    template: 'Knowledge Base',
    domain: 'kb.company.com',
    status: 'draft',
    visitors: 0,
    theme: 'Clean White',
    createdAt: '2026-03-15T10:00:00Z',
    pages: [
      {
        id: 'pg-4',
        title: 'Home',
        slug: '/',
        published: false,
        lastModified: '2026-03-15T10:00:00Z',
        webParts: [
          { id: 'wp11', type: 'hero', label: 'Search', content: { title: 'Knowledge Base', subtitle: 'Find answers to your questions' }, order: 0 },
          { id: 'wp12', type: 'cards', label: 'Categories', content: { card1: 'Getting Started', card2: 'Troubleshooting', card3: 'API Docs', card4: 'Best Practices' }, order: 1 },
        ],
      },
    ],
  },
  {
    id: 'site-4',
    name: 'Event Registration',
    description: 'Public event registration portal with calendar and ticketing',
    template: 'Event Registration',
    domain: 'events.company.com',
    status: 'maintenance',
    visitors: 456,
    theme: 'Vibrant',
    createdAt: '2025-11-20T08:00:00Z',
    pages: [
      {
        id: 'pg-5',
        title: 'Events',
        slug: '/',
        published: true,
        lastModified: '2026-03-10T15:00:00Z',
        webParts: [
          { id: 'wp13', type: 'hero', label: 'Events Banner', content: { title: 'Upcoming Events', subtitle: 'Register for our latest events and workshops' }, order: 0 },
          { id: 'wp14', type: 'cards', label: 'Featured Events', content: { card1: 'Tech Summit 2026', card2: 'Design Workshop', card3: 'Leadership Forum' }, order: 1 },
          { id: 'wp15', type: 'form', label: 'Register', content: { fields: 'Name,Email,Event,Tickets' }, order: 2 },
        ],
      },
    ],
  },
];

const sampleTemplates: PageTemplate[] = [
  { id: 'tmpl-1', name: 'Customer Portal', description: 'Self-service portal for external customers', category: 'External', icon: 'users', previewParts: [] },
  { id: 'tmpl-2', name: 'Employee Self-Service', description: 'HR and employee services portal', category: 'Internal', icon: 'building', previewParts: [] },
  { id: 'tmpl-3', name: 'Knowledge Base', description: 'Searchable documentation and articles', category: 'Content', icon: 'bookOpen', previewParts: [] },
  { id: 'tmpl-4', name: 'Event Registration', description: 'Event listing and registration portal', category: 'External', icon: 'calendar', previewParts: [] },
  { id: 'tmpl-5', name: 'Partner Portal', description: 'Collaboration portal for business partners', category: 'External', icon: 'handshake', previewParts: [] },
  { id: 'tmpl-6', name: 'Community Forum', description: 'Discussion forum with categories and threads', category: 'Community', icon: 'messageCircle', previewParts: [] },
];

export const usePowerPagesStore = create<PowerPagesState>((set) => ({
  sites: sampleSites,
  templates: sampleTemplates,
  activeView: 'sites',
  selectedSiteId: null,
  editorSite: null,
  activePageId: null,
  selectedWebPartId: null,
  editingWebPartId: null,
  searchQuery: '',
  showPageSettings: false,
  pageSettingsTab: 'seo',

  setActiveView: (view) => set({ activeView: view }),
  setSelectedSiteId: (id) => set({ selectedSiteId: id }),
  setEditingWebPartId: (id) => set({ editingWebPartId: id }),
  setShowPageSettings: (show) => set({ showPageSettings: show }),
  setPageSettingsTab: (tab) => set({ pageSettingsTab: tab }),
  setEditorSite: (site) =>
    set({
      editorSite: site,
      activeView: site ? 'editor' : 'sites',
      activePageId: site?.pages[0]?.id ?? null,
    }),
  setActivePageId: (id) => set({ activePageId: id }),
  setSelectedWebPartId: (id) => set({ selectedWebPartId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addWebPart: (pageId, part) =>
    set((s) => {
      if (!s.editorSite) return s;
      return {
        editorSite: {
          ...s.editorSite,
          pages: s.editorSite.pages.map((pg) =>
            pg.id === pageId ? { ...pg, webParts: [...pg.webParts, part] } : pg
          ),
        },
      };
    }),

  removeWebPart: (pageId, partId) =>
    set((s) => {
      if (!s.editorSite) return s;
      return {
        editorSite: {
          ...s.editorSite,
          pages: s.editorSite.pages.map((pg) =>
            pg.id === pageId
              ? { ...pg, webParts: pg.webParts.filter((wp) => wp.id !== partId) }
              : pg
          ),
        },
      };
    }),

  updateWebPart: (pageId, partId, updates) =>
    set((s) => {
      if (!s.editorSite) return s;
      return {
        editorSite: {
          ...s.editorSite,
          pages: s.editorSite.pages.map((pg) =>
            pg.id === pageId
              ? { ...pg, webParts: pg.webParts.map((wp) => (wp.id === partId ? { ...wp, ...updates } : wp)) }
              : pg
          ),
        },
      };
    }),

  insertWebPartAfter: (pageId, afterPartId, part) =>
    set((s) => {
      if (!s.editorSite) return s;
      return {
        editorSite: {
          ...s.editorSite,
          pages: s.editorSite.pages.map((pg) => {
            if (pg.id !== pageId) return pg;
            const idx = pg.webParts.findIndex((wp) => wp.id === afterPartId);
            const newParts = [...pg.webParts];
            newParts.splice(idx + 1, 0, part);
            return { ...pg, webParts: newParts.map((wp, i) => ({ ...wp, order: i })) };
          }),
        },
      };
    }),

  addPage: (page) =>
    set((s) => {
      if (!s.editorSite) return s;
      return {
        editorSite: {
          ...s.editorSite,
          pages: [...s.editorSite.pages, page],
        },
        activePageId: page.id,
      };
    }),

  deletePage: (pageId) =>
    set((s) => {
      if (!s.editorSite) return s;
      const pages = s.editorSite.pages.filter((pg) => pg.id !== pageId);
      return {
        editorSite: { ...s.editorSite, pages },
        activePageId: pages[0]?.id ?? null,
      };
    }),

  togglePagePublished: (pageId) =>
    set((s) => {
      if (!s.editorSite) return s;
      return {
        editorSite: {
          ...s.editorSite,
          pages: s.editorSite.pages.map((pg) =>
            pg.id === pageId ? { ...pg, published: !pg.published } : pg
          ),
        },
      };
    }),
}));
