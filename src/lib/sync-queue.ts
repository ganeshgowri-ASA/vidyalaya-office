/**
 * Sync queue manager for processing pending changes when back online.
 * Queues API requests made while offline and replays them on reconnection.
 */

import {
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  type SyncQueueItem,
  getUnsyncedDocuments,
  markDocumentSynced,
} from './offline-db';

const MAX_RETRIES = 5;

let isSyncing = false;
let syncListeners: Array<(status: SyncStatus) => void> = [];

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'complete';

export function onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
  syncListeners.push(listener);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== listener);
  };
}

function notifyListeners(status: SyncStatus) {
  syncListeners.forEach((l) => l(status));
}

/**
 * Queue a request for later sync.
 */
export async function queueRequest(
  url: string,
  method: string,
  headers: Record<string, string> = {},
  body: string | null = null
): Promise<void> {
  const item: SyncQueueItem = {
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    url,
    method,
    headers,
    body,
    timestamp: Date.now(),
    retries: 0,
  };
  await addToSyncQueue(item);
}

/**
 * Process all pending sync queue items.
 * Called when the app comes back online.
 */
export async function processSyncQueue(): Promise<void> {
  if (isSyncing) return;
  isSyncing = true;
  notifyListeners('syncing');

  try {
    // Process queued API requests
    const queue = await getSyncQueue();
    let hasErrors = false;

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });

        if (response.ok) {
          await removeFromSyncQueue(item.id);
        } else if (item.retries < MAX_RETRIES) {
          // Update retry count - re-add with incremented retries
          await removeFromSyncQueue(item.id);
          await addToSyncQueue({ ...item, retries: item.retries + 1 });
          hasErrors = true;
        } else {
          // Max retries exceeded, remove from queue
          await removeFromSyncQueue(item.id);
          hasErrors = true;
        }
      } catch {
        hasErrors = true;
        break; // Still offline, stop processing
      }
    }

    // Sync unsynced documents
    const unsyncedDocs = await getUnsyncedDocuments();
    for (const doc of unsyncedDocs) {
      try {
        const response = await fetch('/api/documents/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doc),
        });
        if (response.ok) {
          await markDocumentSynced(doc.id);
        }
      } catch {
        hasErrors = true;
        break;
      }
    }

    notifyListeners(hasErrors ? 'error' : 'complete');
  } catch {
    notifyListeners('error');
  } finally {
    isSyncing = false;
  }
}

/**
 * Get the count of pending sync items.
 */
export async function getPendingSyncCount(): Promise<number> {
  const queue = await getSyncQueue();
  const unsyncedDocs = await getUnsyncedDocuments();
  return queue.length + unsyncedDocs.length;
}
