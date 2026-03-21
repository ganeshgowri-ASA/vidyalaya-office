'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import { processSyncQueue, getPendingSyncCount, onSyncStatusChange, type SyncStatus } from '@/lib/sync-queue';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Auto-sync when back online
      processSyncQueue();
      // Hide "back online" banner after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync status changes
    const unsub = onSyncStatusChange((status) => {
      setSyncStatus(status);
      if (status === 'complete') {
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    });

    // Check pending count periodically
    const updatePendingCount = async () => {
      try {
        const count = await getPendingSyncCount();
        setPendingCount(count);
      } catch {
        // IndexedDB may not be available
      }
    };
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
      clearInterval(interval);
    };
  }, []);

  // Offline banner
  if (!isOnline) {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
        style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
      >
        <WifiOff size={14} />
        <span>You are offline. Changes will be saved locally and synced when reconnected.</span>
        {pendingCount > 0 && (
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
            {pendingCount} pending
          </span>
        )}
      </div>
    );
  }

  // Back online + syncing
  if (wasOffline || syncStatus === 'syncing') {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
        style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
      >
        <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
        <span>
          {syncStatus === 'syncing'
            ? 'Syncing pending changes...'
            : 'Back online! All changes synced.'}
        </span>
      </div>
    );
  }

  // Sync error
  if (syncStatus === 'error') {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
        style={{ backgroundColor: '#d97706', color: '#ffffff' }}
      >
        <CloudOff size={14} />
        <span>Some changes failed to sync.</span>
        <button
          onClick={() => processSyncQueue()}
          className="ml-1 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return null;
}
