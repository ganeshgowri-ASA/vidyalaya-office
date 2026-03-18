"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Table2,
  Presentation,
  FileDown,
  LayoutTemplate,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Settings,
  Shield,
  FolderOpen,
  Search,
  Trash2,
  Grid3X3,
  User,
  HelpCircle,
  Workflow,
  Mail,
  MessageSquare,
  Video,
  CalendarDays,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "File Manager", href: "/file-manager", icon: FolderOpen },
  { label: "Search", href: "/search", icon: Search },
];

const editorNav = [
  { label: "Document", href: "/document", icon: FileText },
  { label: "Spreadsheet", href: "/spreadsheet", icon: Table2 },
  { label: "Presentation", href: "/presentation", icon: Presentation },
  { label: "Graphics", href: "/graphics", icon: Workflow },
  { label: "PDF Tools", href: "/pdf", icon: FileDown },
];

const communicateNav = [
  { label: "Email", href: "/email", icon: Mail },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Meetings", href: "/meetings", icon: Video },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
];

const manageNav = [
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Template Gallery", href: "/template-gallery", icon: Grid3X3 },
  { label: "Review & Approval", href: "/review", icon: ClipboardCheck },
  { label: "Doc Control", href: "/doc-control", icon: Shield },
  { label: "Trash", href: "/trash", icon: Trash2 },
];

const bottomNav = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

function NavSection({
  label,
  items,
  pathname,
  sidebarOpen,
}: {
  label?: string;
  items: { label: string; href: string; icon: React.ElementType }[];
  pathname: string;
  sidebarOpen: boolean;
}) {
  return (
    <div className="space-y-0.5">
      {label && sidebarOpen && (
        <p
          className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--sidebar-foreground)", opacity: 0.4 }}
        >
          {label}
        </p>
      )}
      {!label || !sidebarOpen ? null : null}
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
            )}
            style={
              isActive
                ? {
                    backgroundColor: "var(--sidebar-accent)",
                    color: "var(--primary-foreground)",
                  }
                : undefined
            }
            title={!sidebarOpen ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "no-print fixed left-0 top-0 z-30 flex h-full flex-col border-r transition-all duration-300 lg:relative lg:z-0",
          sidebarOpen ? "w-60" : "w-16",
          !sidebarOpen && "max-lg:-translate-x-full"
        )}
        style={{
          backgroundColor: "var(--sidebar)",
          color: "var(--sidebar-foreground)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center justify-between px-4">
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-tight" style={{ color: "var(--sidebar-accent)" }}>
              V
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 transition-colors hover:opacity-80"
            style={{ color: "var(--sidebar-foreground)" }}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          <NavSection items={mainNav} pathname={pathname} sidebarOpen={sidebarOpen} />
          {sidebarOpen && <div className="mx-3 my-2 border-t" style={{ borderColor: "var(--border)", opacity: 0.3 }} />}
          <NavSection label="Editors" items={editorNav} pathname={pathname} sidebarOpen={sidebarOpen} />
          {sidebarOpen && <div className="mx-3 my-2 border-t" style={{ borderColor: "var(--border)", opacity: 0.3 }} />}
          <NavSection label="Communicate" items={communicateNav} pathname={pathname} sidebarOpen={sidebarOpen} />
          {sidebarOpen && <div className="mx-3 my-2 border-t" style={{ borderColor: "var(--border)", opacity: 0.3 }} />}
          <NavSection label="Manage" items={manageNav} pathname={pathname} sidebarOpen={sidebarOpen} />
        </nav>

        {/* Bottom nav */}
        <div className="border-t px-2 py-2 space-y-0.5" style={{ borderColor: "var(--border)" }}>
          <NavSection items={bottomNav} pathname={pathname} sidebarOpen={sidebarOpen} />
        </div>
      </aside>
    </>
  );
}
