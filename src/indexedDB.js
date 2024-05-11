import { openDB } from 'idb';

async function initDB() {
  const db = await openDB('MyAppDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id' });
      }
    },
  });
  return db;
}

async function saveEvent(event) {
  const db = await initDB();
  const tx = db.transaction('events', 'readwrite');
  const store = tx.objectStore('events');
  await store.put(event);
  await tx.done;
}

async function getEvents() {
  const db = await initDB();
  const tx = db.transaction('events', 'readonly');
  const store = tx.objectStore('events');
  const events = await store.getAll();
  return events;
}

export { saveEvent, getEvents };

// Hecho con ayuda de chatGPT, ya que usamos Firebase, pero una indexDB nos ayuda para cuando es offline