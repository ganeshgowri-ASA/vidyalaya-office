'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!sessionStorage.getItem('pwa-install-dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-lg"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
        maxWidth: 360,
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        <Download size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Install Vidyalaya Office</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Install for offline access and a native app experience.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={handleInstall}
          className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-md p-1 transition-colors hover:opacity-70"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
