import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { KeyboardShortcutsModal } from "@/components/layout/keyboard-shortcuts-modal";

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
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
          <KeyboardShortcutsModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
