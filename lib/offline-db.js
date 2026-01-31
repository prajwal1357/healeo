import { openDB } from 'idb';

const DB_NAME = 'caresora_offline';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      // Create a store for pending patient records
      if (!db.objectStoreNames.contains('pending_records')) {
        db.createObjectStore('pending_records', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveRecordOffline(data) {
  const db = await initDB();
  await db.add('pending_records', { ...data, timestamp: new Date().toISOString() });
}

export async function getPendingRecords() {
  const db = await initDB();
  return db.getAll('pending_records');
}

export async function clearSyncedRecord(id) {
  const db = await initDB();
  await db.delete('pending_records', id);
}