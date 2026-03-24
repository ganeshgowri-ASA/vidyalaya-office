"use client";
import React from "react";
import {
  Search, Settings, Share2, Bell, ChevronRight, Home, Menu,
  Star, MoreHorizontal, Globe, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSharePointStore, type SPNavItem } from "@/store/sharepoint-store";

// ── Top Navigation Bar ────────────────────────────────
export function SharePointTopNav() {
  const { currentSite, searchQuery, setSearchQuery, setActiveView, activeView, setShowSettingsPanel } = useSharePointStore();

  return (
    <div className="h-12 flex items-center justify-between px-4 border-b shrink-0" style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)" }}>
      {/* Left - Logo & Site name */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: currentSite.themeColor }}>
          {currentSite.title.charAt(0)}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setActiveView("home")} className="text-sm font-semibold hover:underline" style={{ color: "var(--foreground)" }}>
            {currentSite.title}
          </button>
          <Star size={14} className="cursor-pointer" style={{ color: "var(--foreground)", opacity: 0.3 }} />
        </div>
      </div>

      {/* Center - Nav tabs */}
      <div className="hidden md:flex items-center gap-1">
        {currentSite.navigation.map((nav) => {
          const viewMap: Record<string, string> = {
            "/sharepoint": "home",
            "/sharepoint?view=library": "library",
            "/sharepoint?view=lists": "lists",
            "/sharepoint?view=pages": "pages",
            "/sharepoint?view=news": "news",
          };
          const navView = viewMap[nav.href] || "home";
          const isActive = activeView === navView;

          return (
            <button
              key={nav.id}
              onClick={() => setActiveView(navView as typeof activeView)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
              )}
              style={isActive ? { backgroundColor: "var(--primary)", color: "#fff" } : { color: "var(--foreground)" }}
            >
              {nav.label}
            </button>
          );
        })}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground)", opacity: 0.4 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search this site"
            className="pl-8 pr-3 py-1.5 text-xs rounded-md border w-48 focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
            }}
          />
        </div>
        <button className="p-1.5 rounded hover:bg-white/10" onClick={() => setShowSettingsPanel(true)}>
          <Settings size={16} style={{ color: "var(--foreground)", opacity: 0.6 }} />
        </button>
      </div>
    </div>
  );
}

// ── Breadcrumb Trail ──────────────────────────────────
export function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <div className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={10} />}
          {item.onClick ? (
            <button onClick={item.onClick} className="hover:underline hover:opacity-80">{item.label}</button>
          ) : (
            <span className="opacity-80">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Quick Launch Sidebar ──────────────────────────────
export function QuickLaunchSidebar() {
  const { currentSite, quickLaunchOpen, setQuickLaunchOpen, setActiveView, activeView } = useSharePointStore();

  return (
    <div
      className={cn("border-r shrink-0 transition-all duration-200 flex flex-col", quickLaunchOpen ? "w-52" : "w-10")}
      style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)" }}
    >
      {/* Toggle */}
      <div className="flex items-center justify-between p-2">
        {quickLaunchOpen && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1" style={{ color: "var(--foreground)", opacity: 0.4 }}>
            Quick Launch
          </span>
        )}
        <button onClick={() => setQuickLaunchOpen(!quickLaunchOpen)} className="p-1 rounded hover:bg-white/10">
          {quickLaunchOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </button>
      </div>

      {/* Nav items */}
      {quickLaunchOpen && (
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {currentSite.quickLaunch.map((item) => {
            const viewMap: Record<string, string> = {
              "/sharepoint": "home",
              "/sharepoint?view=library": "library",
              "/sharepoint?view=lists&list=l1": "lists",
              "/sharepoint?view=lists&list=l2": "lists",
              "/sharepoint?view=pages": "pages",
            };
            const navView = viewMap[item.href] || "home";
            const isActive = activeView === navView && item.href.includes(activeView);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.href.includes("view=library")) setActiveView("library");
                  else if (item.href.includes("view=lists")) setActiveView("lists");
                  else if (item.href.includes("view=pages")) setActiveView("pages");
                  else setActiveView("home");
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded transition-colors text-left",
                  isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
                )}
                style={isActive ? { backgroundColor: "var(--sidebar-accent)" } : undefined}
              >
                <span className="truncate" style={{ color: "var(--foreground)" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Edit links */}
      {quickLaunchOpen && (
        <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
          <button className="w-full text-[10px] text-left px-2 py-1 rounded hover:bg-white/10" style={{ color: "var(--primary)" }}>
            Edit quick launch
          </button>
        </div>
      )}
    </div>
  );
}

// ── Hub Site Navigation ───────────────────────────────
const hubTabs: { id: string; label: string }[] = [
  { id: "contoso", label: "Contoso Intranet" },
  { id: "engineering", label: "Engineering Hub" },
  { id: "marketing", label: "Marketing Hub" },
  { id: "hr", label: "HR Portal" },
  { id: "sales", label: "Sales Hub" },
  { id: "procurement", label: "Procurement Hub" },
  { id: "finance", label: "Finance Hub" },
  { id: "operations", label: "Operations Hub" },
  { id: "it", label: "IT Hub" },
  { id: "quality", label: "Quality Hub" },
];

export function HubNavigation() {
  const { currentHubId, setCurrentHub } = useSharePointStore();

  return (
    <div className="h-9 flex items-center gap-4 px-4 border-b overflow-x-auto" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
      <Globe size={14} className="shrink-0" style={{ color: "var(--foreground)", opacity: 0.4 }} />
      {hubTabs.map((tab) => {
        const isActive = tab.id === currentHubId;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentHub(tab.id)}
            className={cn("text-xs font-medium whitespace-nowrap", isActive ? "opacity-100" : "opacity-40 hover:opacity-60")}
            style={{ color: isActive ? "var(--primary)" : "var(--foreground)" }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Site Settings Panel ───────────────────────────────
export function SiteSettingsPanel() {
  const { showSettingsPanel, setShowSettingsPanel, currentSite } = useSharePointStore();

  if (!showSettingsPanel) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettingsPanel(false)} />
      <div className="relative w-80 h-full overflow-y-auto border-l" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Site Settings</h3>
            <button onClick={() => setShowSettingsPanel(false)} className="text-xs" style={{ color: "var(--primary)" }}>Close</button>
          </div>

          <div className="space-y-4">
            {/* Site Info */}
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Site Name</p>
              <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{currentSite.title}</p>
            </div>

            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Description</p>
              <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{currentSite.description}</p>
            </div>

            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Site Type</p>
              <p className="text-sm capitalize" style={{ color: "var(--foreground)", opacity: 0.8 }}>{currentSite.type} Site</p>
            </div>

            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Site Owner</p>
              <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{currentSite.owner}</p>
            </div>

            <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>Theme Color</p>
              <div className="flex gap-2">
                {["#4F46E5", "#059669", "#DC2626", "#D97706", "#7C3AED", "#0891B2"].map((c) => (
                  <div
                    key={c}
                    className={cn("w-6 h-6 rounded-full cursor-pointer border-2", c === currentSite.themeColor ? "border-white" : "border-transparent")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>Members ({currentSite.members.length})</p>
              <div className="flex -space-x-2">
                {currentSite.members.slice(0, 6).map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white" style={{ borderColor: "var(--background)", backgroundColor: ["#4F46E5", "#059669", "#DC2626", "#D97706", "#7C3AED", "#0891B2"][i % 6] }}>
                    {i + 1}
                  </div>
                ))}
                {currentSite.members.length > 6 && (
                  <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold" style={{ borderColor: "var(--background)", backgroundColor: "var(--sidebar)", color: "var(--foreground)" }}>
                    +{currentSite.members.length - 6}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
