"use client";

import {
  FileText,
  Table2,
  Presentation,
  Link2,
  Image,
  File,
  Users,
  Newspaper,
  BarChart3,
  Minus,
} from "lucide-react";
import type { WebPart } from "@/store/pages-store";
import { useState } from "react";

interface WebPartRendererProps {
  webPart: WebPart;
  onUpdate: (updates: Partial<WebPart>) => void;
}

export function WebPartRenderer({ webPart, onUpdate }: WebPartRendererProps) {
  switch (webPart.type) {
    case "text":
      return <TextBlock webPart={webPart} onUpdate={onUpdate} />;
    case "quick-links":
      return <QuickLinksBlock webPart={webPart} />;
    case "people":
      return <PeopleBlock webPart={webPart} />;
    case "news-feed":
      return <NewsFeedBlock webPart={webPart} />;
    case "file-list":
      return <FileListBlock webPart={webPart} />;
    case "image-gallery":
      return <ImageGalleryBlock webPart={webPart} />;
    case "document-embed":
      return <EmbedBlock webPart={webPart} icon={FileText} label="Document" />;
    case "spreadsheet-embed":
      return <EmbedBlock webPart={webPart} icon={Table2} label="Spreadsheet" />;
    case "presentation-embed":
      return <EmbedBlock webPart={webPart} icon={Presentation} label="Presentation" />;
    case "chart":
      return <ChartBlock webPart={webPart} />;
    case "divider":
      return <DividerBlock />;
    default:
      return <PlaceholderBlock webPart={webPart} />;
  }
}

function TextBlock({ webPart, onUpdate }: WebPartRendererProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className="rounded-xl border p-5 transition-colors"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      {webPart.title && <h3 className="mb-3 text-sm font-semibold opacity-70">{webPart.title}</h3>}
      {editing ? (
        <textarea
          value={webPart.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={() => setEditing(false)}
          className="w-full min-h-[80px] resize-y border-none bg-transparent text-sm leading-relaxed outline-none"
          style={{ color: "var(--foreground)" }}
          autoFocus
        />
      ) : (
        <p
          className="cursor-pointer text-sm leading-relaxed opacity-80 hover:opacity-100"
          onClick={() => setEditing(true)}
        >
          {webPart.content || "Click to edit text..."}
        </p>
      )}
    </div>
  );
}

function QuickLinksBlock({ webPart }: { webPart: WebPart }) {
  const links = (webPart.config.links as Array<{ label: string; url: string; icon: string }>) || [];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      <h3 className="mb-3 text-sm font-semibold opacity-70">{webPart.title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {links.length > 0 ? (
          links.map((link, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:opacity-80 cursor-pointer"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
            >
              <Link2 size={14} style={{ color: "var(--primary)" }} />
              <span>{link.label}</span>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-4 text-center text-sm opacity-30">
            <Link2 size={20} className="mx-auto mb-2" />
            No links configured
          </div>
        )}
      </div>
    </div>
  );
}

function PeopleBlock({ webPart }: { webPart: WebPart }) {
  const members = (webPart.config.members as Array<{ name: string; role: string; avatar: string }>) || [];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold opacity-70">
        <Users size={14} />
        {webPart.title}
      </h3>
      <div className="space-y-3">
        {members.length > 0 ? (
          members.map((member, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {member.avatar}
              </div>
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs opacity-50">{member.role}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-sm opacity-30">
            <Users size={20} className="mx-auto mb-2" />
            No team members added
          </div>
        )}
      </div>
    </div>
  );
}

function NewsFeedBlock({ webPart }: { webPart: WebPart }) {
  const items = (webPart.config.items as Array<{ title: string; date: string; summary: string }>) || [];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold opacity-70">
        <Newspaper size={14} />
        {webPart.title}
      </h3>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, i) => (
            <div key={i} className="rounded-lg border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{item.title}</p>
                <span className="text-[10px] opacity-40">{item.date}</span>
              </div>
              <p className="text-xs opacity-60 leading-relaxed">{item.summary}</p>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-sm opacity-30">
            <Newspaper size={20} className="mx-auto mb-2" />
            No news items
          </div>
        )}
      </div>
    </div>
  );
}

function FileListBlock({ webPart }: { webPart: WebPart }) {
  const files = (webPart.config.files as Array<{ name: string; type: string; size: string; modified: string }>) || [];

  const typeIcons: Record<string, React.ElementType> = {
    document: FileText,
    pdf: File,
    spreadsheet: Table2,
    presentation: Presentation,
  };

  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      <h3 className="mb-3 text-sm font-semibold opacity-70">{webPart.title}</h3>
      {files.length > 0 ? (
        <div className="space-y-1">
          {files.map((file, i) => {
            const Icon = typeIcons[file.type] || File;
            return (
              <div key={i} className="flex items-center gap-3 rounded-lg p-2 text-sm transition-colors hover:opacity-80 cursor-pointer" style={{ backgroundColor: "var(--background)" }}>
                <Icon size={16} style={{ color: "var(--primary)" }} />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-xs opacity-40">{file.size}</span>
                <span className="text-xs opacity-40">{file.modified}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-4 text-center text-sm opacity-30">
          <File size={20} className="mx-auto mb-2" />
          No files added
        </div>
      )}
    </div>
  );
}

function ImageGalleryBlock({ webPart }: { webPart: WebPart }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      <h3 className="mb-3 text-sm font-semibold opacity-70">{webPart.title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--background)" }}
          >
            <Image size={20} className="opacity-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmbedBlock({ webPart, icon: Icon, label }: { webPart: WebPart; icon: React.ElementType; label: string }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      <h3 className="mb-3 text-sm font-semibold opacity-70">{webPart.title}</h3>
      <div
        className="flex h-32 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex flex-col items-center gap-2 opacity-30">
          <Icon size={28} />
          <span className="text-xs">Embed {label}</span>
        </div>
      </div>
    </div>
  );
}

function ChartBlock({ webPart }: { webPart: WebPart }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      <h3 className="mb-3 text-sm font-semibold opacity-70">{webPart.title}</h3>
      <div
        className="flex h-40 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex flex-col items-center gap-2 opacity-30">
          <BarChart3 size={28} />
          <span className="text-xs">Chart Widget</span>
        </div>
      </div>
    </div>
  );
}

function DividerBlock() {
  return (
    <div className="flex items-center justify-center py-4">
      <Minus size={20} className="opacity-20" />
      <div className="mx-3 flex-1 border-t" style={{ borderColor: "var(--border)" }} />
      <Minus size={20} className="opacity-20" />
    </div>
  );
}

function PlaceholderBlock({ webPart }: { webPart: WebPart }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
    >
      <p className="text-sm opacity-50">{webPart.title || webPart.type}</p>
    </div>
  );
}
