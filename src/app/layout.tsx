import type { Metadata } from "next";
import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { KeyboardShortcutsModal } from "@/components/layout/keyboard-shortcuts-modal";
import { AIChatWrapper } from "@/components/ai-chat/ai-chat-wrapper";
import { AIProviders } from "@/providers/ai-providers";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";

export const metadata: Metadata = {
  title: "Vidyalaya Office - AI-Native Office Suite",
  description: "An AI-powered office suite with Document, Spreadsheet, Presentation, and PDF tools.",
  manifest: "/manifest.json",
  themeColor: "#7c73e6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vidyalaya Office",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AIProviders>
              <AppShell>{children}</AppShell>
              <KeyboardShortcutsModal />
              <AIChatWrapper />
              <OnboardingTour />
            </AIProviders>
          </AuthProvider>
          <AIProviders>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <OfflineIndicator />
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
            <KeyboardShortcutsModal />
            <AIChatWrapper />
            <OnboardingTour />
            <ServiceWorkerRegistrar />
            <PWAInstallPrompt />
          </AIProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
