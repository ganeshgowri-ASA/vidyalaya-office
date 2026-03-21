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
          <AuthProvider>
            <AIProviders>
              <AppShell>{children}</AppShell>
              <KeyboardShortcutsModal />
              <AIChatWrapper />
              <OnboardingTour />
            </AIProviders>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
