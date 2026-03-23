"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useSharePointStore } from "@/store/sharepoint-store";
import { SharePointTopNav, QuickLaunchSidebar, HubNavigation, SiteSettingsPanel } from "./site-navigation";
import { SitePage, PagesListView, NewsHubView } from "./site-page";
import { DocumentLibrary } from "./document-library";
import { ListView } from "./list-view";

export function SharePointHub() {
  const { activeView } = useSharePointStore();

  function renderView() {
    switch (activeView) {
      case "home": return <SitePage />;
      case "library": return <DocumentLibrary />;
      case "lists": return <ListView />;
      case "pages": return <PagesListView />;
      case "news": return <NewsHubView />;
      case "settings": return <SitePage />;
      default: return <SitePage />;
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--background)" }}>
      {/* Hub Navigation */}
      <HubNavigation />

      {/* Top Navigation */}
      <SharePointTopNav />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Quick Launch Sidebar */}
        <QuickLaunchSidebar />

        {/* Content */}
        {renderView()}
      </div>

      {/* Settings Panel */}
      <SiteSettingsPanel />
    </div>
  );
}
