"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { GuestCollabPrompt } from "@/components/collaboration/guest-collab-prompt";
import { RealtimeCursors } from "@/components/collaboration/realtime-cursors";
import { CommandPalette } from "@/components/layout/command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const isLandingPage = pathname === "/welcome";

  if (isAuthPage || isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <GuestCollabPrompt />
        <main className="relative flex-1 overflow-y-auto p-6 page-transition">
          <RealtimeCursors />
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
