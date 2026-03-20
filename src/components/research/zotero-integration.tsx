'use client';

import { useState, useEffect, useCallback } from 'react';
import { useResearchStore } from '@/store/research-store';
import { zoteroService, ZoteroCollection, ZoteroItem } from '@/lib/services/zotero-service';
import { cn } from '@/lib/utils';
import {
  BookOpen, Search, ChevronRight, ChevronDown, FolderOpen, Folder,
  Link, Unlink, Key, RefreshCw, Tag, FileText, Copy, Plus,
  ExternalLink, BookMarked, Download, Check,
} from 'lucide-react';

function CollectionTree({
  collections,
  selectedKey,
  onSelect,
  depth = 0,
}: {
  collections: ZoteroCollection[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div>
      {collections.map((col) => (
        <div key={col.key}>
          <button
            onClick={() => {
              onSelect(col.key);
              if (col.children.length > 0) {
                setExpanded((prev) => ({ ...prev, [col.key]: !prev[col.key] }));
              }
            }}
            className={cn(
              'w-full flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors',
              selectedKey === col.key ? 'font-medium' : 'opacity-70 hover:opacity-100'
            )}
            style={{
              paddingLeft: `${depth * 16 + 8}px`,
              backgroundColor: selectedKey === col.key ? 'var(--sidebar-accent)' : undefined,
            }}
          >
            {col.children.length > 0 ? (
              expanded[col.key] ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            ) : (
              <span className="w-3" />
            )}
            {expanded[col.key] ? <FolderOpen size={13} style={{ color: 'var(--primary)' }} /> : <Folder size={13} />}
            <span className="truncate flex-1 text-left">{col.name}</span>
            <span className="text-[10px] opacity-40">{col.numItems}</span>
          </button>
          {expanded[col.key] && col.children.length > 0 && (
            <CollectionTree collections={col.children} selectedKey={selectedKey} onSelect={onSelect} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

function ZoteroItemRow({
  item,
  onInsert,
  onCopyBibtex,
  inserted,
}: {
  item: ZoteroItem;
  onInsert: (item: ZoteroItem) => void;
  onCopyBibtex: (item: ZoteroItem) => void;
  inserted: boolean;
}) {
  const authorStr = item.authors.map((a) => `${a.lastName}, ${a.firstName.charAt(0)}.`).join('; ');
  const typeIcons: Record<string, string> = {
    journalArticle: 'J',
    book: 'B',
    conferencePaper: 'C',
    thesis: 'T',
    report: 'R',
    webpage: 'W',
    bookSection: 'S',
  };

  return (
    <div
      className="px-3 py-2.5 border-b hover:opacity-90 transition-opacity"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', opacity: 0.8 }}
        >
          {typeIcons[item.itemType] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium leading-tight">{item.title}</p>
          <p className="text-[10px] opacity-50 mt-0.5 truncate">{authorStr}</p>
          <div className="flex items-center gap-2 mt-1">
            {item.journal && <span className="text-[10px] opacity-40 truncate">{item.journal}</span>}
            <span className="text-[10px] opacity-40">{item.year}</span>
          </div>
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-1.5 py-0.5 rounded-full opacity-60"
                  style={{ backgroundColor: 'var(--sidebar-accent)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 ml-8">
        <button
          onClick={() => onInsert(item)}
          disabled={inserted}
          className={cn(
            'flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors',
            inserted ? 'opacity-40' : 'hover:opacity-80'
          )}
          style={{ backgroundColor: inserted ? 'var(--sidebar-accent)' : 'var(--primary)', color: inserted ? 'var(--foreground)' : 'var(--primary-foreground)' }}
        >
          {inserted ? <Check size={10} /> : <Plus size={10} />}
          {inserted ? 'Added' : 'Insert Citation'}
        </button>
        <button
          onClick={() => onCopyBibtex(item)}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border opacity-60 hover:opacity-100 transition-colors"
          style={{ borderColor: 'var(--border)' }}
        >
          <Copy size={10} /> BibTeX
        </button>
        {item.doi && (
          <button
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border opacity-40 hover:opacity-80 transition-colors"
            style={{ borderColor: 'var(--border)' }}
            title={item.doi}
          >
            <ExternalLink size={10} /> DOI
          </button>
        )}
      </div>
    </div>
  );
}

export default function ZoteroIntegration() {
  const { addCitation, citations } = useResearchStore();

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState('');
  const [collections, setCollections] = useState<ZoteroCollection[]>([]);
  const [items, setItems] = useState<ZoteroItem[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'sync'>('browse');
  const [copiedBibtex, setCopiedBibtex] = useState<string | null>(null);
  const [insertedKeys, setInsertedKeys] = useState<Set<string>>(new Set());
  const [bibtexOutput, setBibtexOutput] = useState('');

  const handleConnect = async () => {
    setConnecting(true);
    const success = await zoteroService.connect({ apiKey, userId, libraryType: 'user' });
    if (success) {
      setConnected(true);
      const cols = await zoteroService.getCollections();
      setCollections(cols);
      const allItems = await zoteroService.getAllItems();
      setItems(allItems);
    }
    setConnecting(false);
  };

  const handleDisconnect = () => {
    zoteroService.disconnect();
    setConnected(false);
    setCollections([]);
    setItems([]);
    setSelectedCollection(null);
  };

  const handleSelectCollection = useCallback(async (key: string) => {
    setSelectedCollection(key);
    setLoading(true);
    const collectionItems = await zoteroService.getCollectionItems(key);
    setItems(collectionItems);
    setLoading(false);
  }, []);

  const handleShowAll = async () => {
    setSelectedCollection(null);
    setLoading(true);
    const allItems = await zoteroService.getAllItems();
    setItems(allItems);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await zoteroService.searchItems(searchQuery);
    setItems(results);
    setSearching(false);
  };

  const handleInsertCitation = (item: ZoteroItem) => {
    const citation = zoteroService.zoteroItemToCitation(item);
    addCitation(citation);
    setInsertedKeys((prev) => new Set(prev).add(item.key));
  };

  const handleCopyBibtex = (item: ZoteroItem) => {
    const bibtex = zoteroService.generateBibTeX(item);
    navigator.clipboard.writeText(bibtex).catch(() => {});
    setCopiedBibtex(item.key);
    setTimeout(() => setCopiedBibtex(null), 2000);
  };

  const handleGenerateAllBibtex = () => {
    const bibtex = zoteroService.generateBibTeXAll(items);
    setBibtexOutput(bibtex);
  };

  const handleSyncBibliography = async () => {
    setLoading(true);
    const allItems = await zoteroService.getAllItems();
    let insertCount = 0;
    allItems.forEach((item) => {
      const exists = citations.some((c) => c.doi === item.doi && item.doi);
      if (!exists) {
        const citation = zoteroService.zoteroItemToCitation(item);
        addCitation(citation);
        insertCount++;
      }
    });
    setLoading(false);
  };

  // Connection screen
  if (!connected) {
    return (
      <div className="h-full overflow-y-auto p-3" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} style={{ color: 'var(--primary)' }} />
          <h3 className="text-sm font-semibold">Zotero Integration</h3>
        </div>

        <div
          className="rounded-lg border p-4 mb-4"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Key size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-medium">Connect to Zotero</span>
          </div>
          <p className="text-[10px] opacity-50 mb-3">
            Enter your Zotero API key and User ID to connect your library. You can generate an API key at zotero.org/settings/keys.
          </p>

          <div className="space-y-2 mb-3">
            <div>
              <label className="text-[10px] opacity-60 block mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Zotero API key"
                className="w-full text-xs px-2.5 py-1.5 rounded border outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-[10px] opacity-60 block mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your Zotero User ID"
                className="w-full text-xs px-2.5 py-1.5 rounded border outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={!apiKey || !userId || connecting}
            className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-opacity disabled:opacity-40"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {connecting ? (
              <>
                <RefreshCw size={12} className="animate-spin" /> Connecting...
              </>
            ) : (
              <>
                <Link size={12} /> Connect to Zotero
              </>
            )}
          </button>
        </div>

        <div className="text-[10px] opacity-40 space-y-1.5 px-1">
          <p className="font-medium opacity-70">How to get your API key:</p>
          <p>1. Go to zotero.org/settings/keys</p>
          <p>2. Click &quot;Create new private key&quot;</p>
          <p>3. Give it a description and set permissions</p>
          <p>4. Copy the key and paste it above</p>
          <p className="mt-2 opacity-70">Your User ID can be found at zotero.org/settings/keys (shown at the top).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <BookOpen size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold">Zotero Library</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1 text-[10px] opacity-50 hover:opacity-80 transition-opacity"
          >
            <Unlink size={10} /> Disconnect
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {(['browse', 'search', 'sync'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'browse') handleShowAll();
              }}
              className={cn(
                'text-[10px] px-2 py-1 rounded transition-colors capitalize',
                activeTab === tab ? 'font-medium' : 'opacity-50 hover:opacity-80'
              )}
              style={activeTab === tab ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'browse' && (
          <>
            {/* Collection tree */}
            <div
              className="border-b overflow-y-auto"
              style={{ borderColor: 'var(--border)', maxHeight: '180px' }}
            >
              <div className="px-2 py-1.5">
                <button
                  onClick={handleShowAll}
                  className={cn(
                    'w-full flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors',
                    !selectedCollection ? 'font-medium' : 'opacity-60 hover:opacity-100'
                  )}
                  style={!selectedCollection ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
                >
                  <BookMarked size={12} /> All Items
                </button>
                <CollectionTree
                  collections={collections}
                  selectedKey={selectedCollection}
                  onSelect={handleSelectCollection}
                />
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-xs opacity-50">
                  <RefreshCw size={14} className="animate-spin mr-2" /> Loading...
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-xs opacity-40">No items in this collection</div>
              ) : (
                items.map((item) => (
                  <ZoteroItemRow
                    key={item.key}
                    item={item}
                    onInsert={handleInsertCitation}
                    onCopyBibtex={handleCopyBibtex}
                    inserted={insertedKeys.has(item.key)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="flex gap-1.5 mb-3">
                <div className="flex-1 relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by title, author, year, tag..."
                    className="w-full text-xs pl-7 pr-2.5 py-1.5 rounded border outline-none"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="text-xs px-3 py-1.5 rounded font-medium"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  {searching ? <RefreshCw size={12} className="animate-spin" /> : 'Search'}
                </button>
              </div>

              <div className="text-[10px] opacity-40 mb-2">
                {items.length > 0 ? `${items.length} results found` : 'Search your Zotero library'}
              </div>
            </div>

            {items.map((item) => (
              <ZoteroItemRow
                key={item.key}
                item={item}
                onInsert={handleInsertCitation}
                onCopyBibtex={handleCopyBibtex}
                inserted={insertedKeys.has(item.key)}
              />
            ))}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="p-3 space-y-3 overflow-y-auto flex-1">
            <div
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <Download size={12} /> Sync Bibliography
              </h4>
              <p className="text-[10px] opacity-50 mb-2">
                Import all references from your Zotero library into the current document&apos;s citation manager.
              </p>
              <button
                onClick={handleSyncBibliography}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded font-medium transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" /> Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} /> Sync Now
                  </>
                )}
              </button>
            </div>

            <div
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <FileText size={12} /> Generate BibTeX
              </h4>
              <p className="text-[10px] opacity-50 mb-2">
                Generate BibTeX entries for all items currently displayed.
              </p>
              <button
                onClick={handleGenerateAllBibtex}
                className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded border font-medium transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--border)' }}
              >
                <Copy size={12} /> Generate BibTeX
              </button>
              {bibtexOutput && (
                <div className="mt-2">
                  <textarea
                    readOnly
                    value={bibtexOutput}
                    className="w-full text-[10px] p-2 rounded border font-mono"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)', height: '200px' }}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(bibtexOutput).catch(() => {}); }}
                    className="mt-1 text-[10px] px-2 py-1 rounded opacity-60 hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--sidebar-accent)' }}
                  >
                    Copy All
                  </button>
                </div>
              )}
            </div>

            <div
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <Tag size={12} /> Connection Info
              </h4>
              <div className="space-y-1 text-[10px] opacity-60">
                <p>Status: <span className="text-green-400">Connected</span></p>
                <p>Library: User Library</p>
                <p>Collections: {collections.length}</p>
                <p>Total items: {items.length}+</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
