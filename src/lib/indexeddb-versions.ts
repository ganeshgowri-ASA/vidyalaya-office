'use client';

export interface StoredVersion {
  id: string;
  fileId: string;
  fileType: string;
  content: string;
  timestamp: string;
  author: string;
  label: string;
  size: number;
  isAutoSave: boolean;
}

const DB_NAME = 'vidyalaya-versions';
const DB_VERSION = 1;
const STORE_NAME = 'versions';
const MAX_VERSIONS_PER_FILE = 50;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('fileId', 'fileId', { unique: false });
        store.createIndex('fileId_timestamp', ['fileId', 'timestamp'], { unique: false });
      }
    };
  });
}

export async function saveVersion(version: StoredVersion): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(version);
    tx.oncomplete = () => {
      resolve();
      enforceVersionLimit(version.fileId);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getVersionsByFileId(fileId: string): Promise<StoredVersion[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('fileId');
    const request = index.getAll(fileId);
    request.onsuccess = () => {
      const results = request.result as StoredVersion[];
      results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getVersionById(id: string): Promise<StoredVersion | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as StoredVersion | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteVersion(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function enforceVersionLimit(fileId: string): Promise<void> {
  const versions = await getVersionsByFileId(fileId);
  if (versions.length > MAX_VERSIONS_PER_FILE) {
    const toRemove = versions.slice(MAX_VERSIONS_PER_FILE);
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const v of toRemove) {
      store.delete(v.id);
    }
  }
}

export function computeContentSize(content: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(content).length;
  }
  return content.length * 2;
}
