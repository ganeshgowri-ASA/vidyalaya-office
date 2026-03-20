import type { Metadata } from "next";
import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { KeyboardShortcutsModal } from "@/components/layout/keyboard-shortcuts-modal";
import { AIChatWrapper } from "@/components/ai-chat/ai-chat-wrapper";
import { AIProviders } from "@/providers/ai-providers";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

export const metadata: Metadata = {
  title: "Vidyalaya Office - AI-Native Office Suite",
  description: "An AI-powered office suite with Document, Spreadsheet, Presentation, and PDF tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AIProviders>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
            <KeyboardShortcutsModal />
            <AIChatWrapper />
            <OnboardingTour />
          </AIProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
