"use client";
import React, { useState, useMemo } from "react";
import {
  FileText, Image, Newspaper, Link2, Users, Calendar, CloudSun,
  Timer, Code, Minus, MoveVertical, MousePointerClick, Clock,
  Activity, ChevronRight, Eye, Star, Heart, GraduationCap,
  Monitor, Receipt, BookOpen, ExternalLink,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SPWebPart, SPNewsItem, SPEvent, SPPerson, SPDocument } from "@/store/sharepoint-store";
import { useSharePointStore } from "@/store/sharepoint-store";

// ── Helper ────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeUntil(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes };
}

function getFileIcon(ext?: string) {
  switch (ext) {
    case "xlsx": return <span className="text-green-400 font-bold text-xs">XLS</span>;
    case "docx": return <span className="text-blue-400 font-bold text-xs">DOC</span>;
    case "pptx": return <span className="text-orange-400 font-bold text-xs">PPT</span>;
    case "pdf": return <span className="text-red-400 font-bold text-xs">PDF</span>;
    case "md": return <span className="text-gray-400 font-bold text-xs">MD</span>;
    default: return <FileText size={14} />;
  }
}

const quickLinkIcons: Record<string, React.ElementType> = {
  monitor: Monitor,
  users: Users,
  receipt: Receipt,
  graduationCap: GraduationCap,
  contact: BookOpen,
  heart: Heart,
};

// ── Web Part Wrapper ──────────────────────────────────
function WebPartWrapper({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border", className)} style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
      {title && (
        <div className="px-5 pt-4 pb-2">
          <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>{title}</h3>
        </div>
      )}
      <div className="px-5 pb-4">{children}</div>
    </div>
  );
}

// ── Text Web Part ─────────────────────────────────────
function TextWebPart({ config }: { config: Record<string, unknown> }) {
  const text = (config.content as string) || "Add your text content here. This web part supports rich text editing.";
  return (
    <WebPartWrapper>
      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.8 }}>{text}</p>
    </WebPartWrapper>
  );
}

// ── Image Web Part ────────────────────────────────────
function ImageWebPart({ config }: { config: Record<string, unknown> }) {
  const caption = (config.caption as string) || "Image";
  const color = (config.color as string) || "#4F46E5";
  return (
    <WebPartWrapper>
      <div className="rounded-lg flex items-center justify-center h-48" style={{ backgroundColor: color + "20" }}>
        <Image size={48} style={{ color }} />
      </div>
      {caption && <p className="text-xs mt-2 text-center" style={{ color: "var(--foreground)", opacity: 0.6 }}>{caption}</p>}
    </WebPartWrapper>
  );
}

// ── Hero Web Part ─────────────────────────────────────
function HeroWebPart({ config }: { config: Record<string, unknown> }) {
  const items = (config.items as Array<{ title: string; description: string; category: string; author: string }>) || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const heroColors = ["#4F46E5", "#059669", "#DC2626", "#D97706"];

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
      {/* Main hero */}
      <div className="relative h-72 flex items-end p-6" style={{ backgroundColor: heroColors[activeIdx] + "30" }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${heroColors[activeIdx]}40, ${heroColors[activeIdx]}10)` }} />
        <div className="relative z-10">
          <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: heroColors[activeIdx], color: "#fff" }}>
            {items[activeIdx]?.category}
          </span>
          <h2 className="text-2xl font-bold mt-3" style={{ color: "var(--foreground)" }}>{items[activeIdx]?.title}</h2>
          <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>{items[activeIdx]?.description}</p>
          <p className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.5 }}>By {items[activeIdx]?.author}</p>
        </div>
      </div>
      {/* Tile strip */}
      <div className="grid grid-cols-4 gap-px" style={{ backgroundColor: "var(--border)" }}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={cn("p-3 text-left transition-colors", i === activeIdx ? "opacity-100" : "opacity-60 hover:opacity-80")}
            style={{ backgroundColor: i === activeIdx ? heroColors[i] + "20" : "var(--background)" }}
          >
            <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{item.title}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>{item.category}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── News Web Part ─────────────────────────────────────
function NewsWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const { news } = useSharePointStore();
  const count = (config.count as number) || 4;
  const displayed = news.slice(0, count);
  const categoryColors: Record<string, string> = {
    Company: "#4F46E5", HR: "#059669", Product: "#D97706", Engineering: "#DC2626", Community: "#7C3AED", Security: "#0891B2",
  };

  return (
    <WebPartWrapper title={title}>
      <div className="space-y-3">
        {displayed.map((n) => (
          <div key={n.id} className="group cursor-pointer rounded-md p-3 transition-colors hover:bg-white/5">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: (categoryColors[n.category] || "#666") + "20" }}>
                <Newspaper size={20} style={{ color: categoryColors[n.category] || "#666" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold group-hover:underline" style={{ color: "var(--foreground)" }}>{n.title}</h4>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>{n.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: (categoryColors[n.category] || "#666") + "20", color: categoryColors[n.category] || "#666" }}>{n.category}</span>
                  <span className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>{formatDate(n.publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="text-xs font-medium mt-3 flex items-center gap-1 hover:underline" style={{ color: "var(--primary)" }}>
        See all news <ChevronRight size={12} />
      </button>
    </WebPartWrapper>
  );
}

// ── Document Library Web Part ─────────────────────────
function DocumentLibraryWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const { documents } = useSharePointStore();
  const count = (config.count as number) || 5;
  const files = documents.filter((d) => d.type === "file").slice(0, count);

  return (
    <WebPartWrapper title={title || "Documents"}>
      <div className="space-y-1">
        {files.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: "var(--sidebar)" }}>
              {getFileIcon(doc.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{doc.name}</p>
              <p className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>{doc.modifiedBy} · {formatDate(doc.modifiedAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </WebPartWrapper>
  );
}

// ── Recent Documents Web Part ─────────────────────────
function RecentDocumentsWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const { documents } = useSharePointStore();
  const count = (config.count as number) || 5;
  const files = documents
    .filter((d) => d.type === "file")
    .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
    .slice(0, count);

  return (
    <WebPartWrapper title={title || "Recent Documents"}>
      <div className="space-y-1">
        {files.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-white/5 cursor-pointer group">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: "var(--sidebar)" }}>
              {getFileIcon(doc.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate group-hover:underline" style={{ color: "var(--foreground)" }}>{doc.name}</p>
              <p className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                Modified by {doc.modifiedBy} · {formatDate(doc.modifiedAt)}
                {doc.size ? ` · ${(doc.size / 1024).toFixed(0)} KB` : ""}
              </p>
            </div>
            <Eye size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
        ))}
      </div>
    </WebPartWrapper>
  );
}

// ── List Web Part ─────────────────────────────────────
function ListWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const { lists } = useSharePointStore();
  const listId = config.listId as string;
  const list = lists.find((l) => l.id === listId) || lists[0];
  if (!list) return null;
  const displayCols = list.columns.slice(0, 4);

  return (
    <WebPartWrapper title={title || list.title}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              {displayCols.map((col) => (
                <th key={col.id} className="text-left py-2 px-2 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>{col.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.items.slice(0, 5).map((item) => (
              <tr key={item.id} className="border-b hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
                {displayCols.map((col) => (
                  <td key={col.id} className="py-2 px-2 text-xs" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                    {String(item.values[col.name] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WebPartWrapper>
  );
}

// ── Quick Links Web Part ──────────────────────────────
function QuickLinksWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const links = (config.links as Array<{ label: string; icon: string; url: string }>) || [];

  return (
    <WebPartWrapper title={title}>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {links.map((link, i) => {
          const IconComp = quickLinkIcons[link.icon] || Link2;
          return (
            <button
              key={i}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--primary)", opacity: 0.15 }}>
                <IconComp size={18} style={{ color: "var(--primary)" }} />
              </div>
              <span className="text-xs font-medium text-center" style={{ color: "var(--foreground)" }}>{link.label}</span>
            </button>
          );
        })}
      </div>
    </WebPartWrapper>
  );
}

// ── People Web Part ───────────────────────────────────
function PeopleWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const { people } = useSharePointStore();
  const personIds = (config.people as string[]) || [];
  const displayed = personIds.length > 0 ? people.filter((p) => personIds.includes(p.id)) : people.slice(0, 4);

  return (
    <WebPartWrapper title={title}>
      <div className="grid grid-cols-2 gap-3">
        {displayed.map((person) => (
          <div key={person.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-white/5 cursor-pointer" style={{ borderColor: "var(--border)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: person.avatarColor }}>
              {person.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{person.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--foreground)", opacity: 0.5 }}>{person.title}</p>
            </div>
          </div>
        ))}
      </div>
    </WebPartWrapper>
  );
}

// ── Events Web Part ───────────────────────────────────
function EventsWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const { events } = useSharePointStore();
  const count = (config.count as number) || 4;
  const displayed = events.slice(0, count);

  return (
    <WebPartWrapper title={title}>
      <div className="space-y-2">
        {displayed.map((evt) => {
          const date = new Date(evt.startDate);
          return (
            <div key={evt.id} className="flex gap-3 p-2.5 rounded-md hover:bg-white/5 cursor-pointer">
              <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: evt.color + "20" }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: evt.color }}>{date.toLocaleDateString("en-US", { month: "short" })}</span>
                <span className="text-lg font-bold leading-tight" style={{ color: evt.color }}>{date.getDate()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{evt.title}</p>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                  {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {evt.location}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button className="text-xs font-medium mt-3 flex items-center gap-1 hover:underline" style={{ color: "var(--primary)" }}>
        See all events <ChevronRight size={12} />
      </button>
    </WebPartWrapper>
  );
}

// ── Weather Web Part ──────────────────────────────────
function WeatherWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const city = (config.city as string) || "San Francisco";
  const temp = (config.temp as number) || 68;
  const condition = (config.condition as string) || "Partly Cloudy";
  const humidity = (config.humidity as number) || 55;

  return (
    <WebPartWrapper title={title}>
      <div className="flex items-center gap-4">
        <CloudSun size={40} style={{ color: "#F59E0B" }} />
        <div>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{temp}°F</p>
          <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>{condition}</p>
          <p className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>{city} · Humidity {humidity}%</p>
        </div>
      </div>
    </WebPartWrapper>
  );
}

// ── Countdown Web Part ────────────────────────────────
function CountdownWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const targetDate = (config.targetDate as string) || "2026-05-01T09:00:00";
  const label = (config.label as string) || "Countdown";
  const { days, hours, minutes } = timeUntil(targetDate);

  return (
    <WebPartWrapper title={title}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-4">
          {[{ val: days, label: "Days" }, { val: hours, label: "Hours" }, { val: minutes, label: "Min" }].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className="text-3xl font-bold" style={{ color: "var(--primary)" }}>{item.val}</span>
              <span className="text-[10px] uppercase font-medium" style={{ color: "var(--foreground)", opacity: 0.4 }}>{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>{label}</p>
      </div>
    </WebPartWrapper>
  );
}

// ── Embed Web Part ────────────────────────────────────
function EmbedWebPart({ config }: { config: Record<string, unknown> }) {
  const url = (config.url as string) || "";
  return (
    <WebPartWrapper>
      <div className="rounded-lg border flex items-center justify-center h-48" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
        <div className="text-center">
          <Code size={24} className="mx-auto mb-2" style={{ color: "var(--foreground)", opacity: 0.4 }} />
          <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Embedded content{url ? `: ${url}` : ""}</p>
        </div>
      </div>
    </WebPartWrapper>
  );
}

// ── Divider Web Part ──────────────────────────────────
function DividerWebPart() {
  return (
    <div className="py-2">
      <hr style={{ borderColor: "var(--border)", opacity: 0.3 }} />
    </div>
  );
}

// ── Spacer Web Part ───────────────────────────────────
function SpacerWebPart({ config }: { config: Record<string, unknown> }) {
  const height = (config.height as number) || 40;
  return <div style={{ height }} />;
}

// ── Button Web Part ───────────────────────────────────
function ButtonWebPart({ config }: { config: Record<string, unknown> }) {
  const label = (config.label as string) || "Click Here";
  const alignment = (config.alignment as string) || "center";

  return (
    <WebPartWrapper>
      <div className={cn("flex", alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start")}>
        <button className="px-6 py-2.5 rounded-md text-sm font-medium text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--primary)" }}>
          {label}
        </button>
      </div>
    </WebPartWrapper>
  );
}

// ── Image Gallery Web Part ────────────────────────────
function ImageGalleryWebPart({ title, config }: { title?: string; config: Record<string, unknown> }) {
  const images = (config.images as Array<{ caption: string; color: string }>) || [];

  return (
    <WebPartWrapper title={title}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-square rounded-lg flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: img.color + "20" }}>
              <Image size={32} style={{ color: img.color }} />
            </div>
            <p className="text-xs mt-1.5 text-center" style={{ color: "var(--foreground)", opacity: 0.6 }}>{img.caption}</p>
          </div>
        ))}
      </div>
    </WebPartWrapper>
  );
}

// ── Site Activity Web Part ────────────────────────────
function SiteActivityWebPart({ title }: { title?: string }) {
  const activities = [
    { user: "Sarah Chen", action: "updated", target: "Q1 Budget Report.xlsx", time: "2 hours ago" },
    { user: "David Kim", action: "shared", target: "API Documentation.md", time: "4 hours ago" },
    { user: "Marcus Johnson", action: "created", target: "Product Roadmap 2026.pptx", time: "Yesterday" },
    { user: "Priya Patel", action: "commented on", target: "Brand Guidelines v3.pdf", time: "Yesterday" },
  ];

  return (
    <WebPartWrapper title={title || "Site Activity"}>
      <div className="space-y-2.5">
        {activities.map((act, i) => (
          <div key={i} className="flex items-start gap-2">
            <Activity size={12} className="mt-1 shrink-0" style={{ color: "var(--primary)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                <span className="font-medium">{act.user}</span> {act.action} <span className="font-medium">{act.target}</span>
              </p>
              <p className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>{act.time}</p>
            </div>
          </div>
        ))}
      </div>
    </WebPartWrapper>
  );
}

// ── Web Part Renderer ─────────────────────────────────
export function RenderWebPart({ webPart }: { webPart: SPWebPart }) {
  switch (webPart.type) {
    case "text": return <TextWebPart config={webPart.config} />;
    case "image": return <ImageWebPart config={webPart.config} />;
    case "hero": return <HeroWebPart config={webPart.config} />;
    case "news": return <NewsWebPart title={webPart.title} config={webPart.config} />;
    case "documentLibrary": return <DocumentLibraryWebPart title={webPart.title} config={webPart.config} />;
    case "recentDocuments": return <RecentDocumentsWebPart title={webPart.title} config={webPart.config} />;
    case "list": return <ListWebPart title={webPart.title} config={webPart.config} />;
    case "quickLinks": return <QuickLinksWebPart title={webPart.title} config={webPart.config} />;
    case "people": return <PeopleWebPart title={webPart.title} config={webPart.config} />;
    case "events": return <EventsWebPart title={webPart.title} config={webPart.config} />;
    case "weather": return <WeatherWebPart title={webPart.title} config={webPart.config} />;
    case "countdown": return <CountdownWebPart title={webPart.title} config={webPart.config} />;
    case "embed": return <EmbedWebPart config={webPart.config} />;
    case "divider": return <DividerWebPart />;
    case "spacer": return <SpacerWebPart config={webPart.config} />;
    case "button": return <ButtonWebPart config={webPart.config} />;
    case "imageGallery": return <ImageGalleryWebPart title={webPart.title} config={webPart.config} />;
    case "siteActivity": return <SiteActivityWebPart title={webPart.title} />;
    default: return <WebPartWrapper><p className="text-xs opacity-50">Unknown web part: {webPart.type}</p></WebPartWrapper>;
  }
}

// ── Web Part Catalog (for edit mode) ──────────────────
export const webPartCatalog: { type: SPWebPart["type"]; label: string; icon: React.ElementType; description: string }[] = [
  { type: "text", label: "Text", icon: FileText, description: "Add rich text content" },
  { type: "image", label: "Image", icon: Image, description: "Display an image" },
  { type: "hero", label: "Hero", icon: Star, description: "Full-width hero banner" },
  { type: "news", label: "News", icon: Newspaper, description: "Show latest news posts" },
  { type: "documentLibrary", label: "Document Library", icon: FileText, description: "Embed a document library" },
  { type: "list", label: "List", icon: LayoutGrid, description: "Display a SharePoint list" },
  { type: "quickLinks", label: "Quick Links", icon: Link2, description: "Collection of links" },
  { type: "people", label: "People", icon: Users, description: "Show team members" },
  { type: "events", label: "Events", icon: Calendar, description: "Upcoming events calendar" },
  { type: "weather", label: "Weather", icon: CloudSun, description: "Weather information" },
  { type: "countdown", label: "Countdown", icon: Timer, description: "Countdown to a date" },
  { type: "embed", label: "Embed", icon: Code, description: "Embed external content" },
  { type: "divider", label: "Divider", icon: Minus, description: "Horizontal divider line" },
  { type: "spacer", label: "Spacer", icon: MoveVertical, description: "Vertical space" },
  { type: "button", label: "Button", icon: MousePointerClick, description: "Call to action button" },
  { type: "imageGallery", label: "Image Gallery", icon: Image, description: "Photo gallery grid" },
  { type: "recentDocuments", label: "Recent Documents", icon: Clock, description: "Recently modified files" },
  { type: "siteActivity", label: "Site Activity", icon: Activity, description: "Recent site activity feed" },
];
