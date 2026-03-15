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
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Document", href: "/document", icon: FileText },
  { label: "Spreadsheet", href: "/spreadsheet", icon: Table2 },
  { label: "Presentation", href: "/presentation", icon: Presentation },
  { label: "PDF Tools", href: "/pdf", icon: FileDown },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Review & Approval", href: "/review", icon: ClipboardCheck },
  { label: "Doc Control", href: "/doc-control", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
];

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
        <nav className="flex-1 space-y-1 px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
                <item.icon size={20} className="shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
