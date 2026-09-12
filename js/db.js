// Local storage layer. Everything here is IndexedDB — nothing touches the
// network. Two stores: "entries" (the records) and "meta" (just the ID
// counter, so entry IDs stay human-readable and never collide, even if two
// entries are created in the same second).

const DB_NAME = 'cosmonautsUxResearchFieldEvidenceDB';
const DB_VERSION = 2;
const ENTRY_FIELDS = [
  'id', 'createdAt', 'updatedAt', 'status', 'source', 'evidenceType',
  'participantRole', 'orgContext', 'eventObjective', 'outreach',
  'workflowStage', 'directEvidence', 'recentExample', 'researchArea',
  'interpretation', 'outsideModel', 'contextLimitation', 'followUpNeeded',
  'deleted', 'deletedAt'
];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('entries')) {
        db.createObjectStore('entries', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }

      // Version 2 removes fields that are not part of the final information model
      // from records created during local testing.
      if (event.oldVersion < 2) {
        const entriesStore = event.target.transaction.objectStore('entries');
        const cursorRequest = entriesStore.openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor) return;
          const entry = cursor.value;
          Object.keys(entry).forEach((key) => {
            if (!ENTRY_FIELDS.includes(key)) delete entry[key];
          });
          cursor.update(entry);
          cursor.continue();
        };
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function pad(num, size) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

// Creates a new entry and reserves its ID in the same transaction, so two
// rapid taps on "New entry" can never produce the same ID.
function createEntry(db, initialFields) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['meta', 'entries'], 'readwrite');
    const metaStore = tx.objectStore('meta');
    const entriesStore = tx.objectStore('entries');

    const counterRequest = metaStore.get('entryCounter');

    counterRequest.onsuccess = () => {
      const current = counterRequest.result ? counterRequest.result.value : 0;
      const next = current + 1;
      metaStore.put({ key: 'entryCounter', value: next });

      const now = new Date().toISOString();
      const entry = Object.assign(
        {
          id: 'E-' + pad(next, 3),
          createdAt: now,
          updatedAt: now,
          status: 'rapid_note',
          source: 'app',
          evidenceType: '',
          participantRole: '',
          orgContext: '',
          eventObjective: [],
          outreach: '',
          workflowStage: [],
          directEvidence: '',
          recentExample: '',
          researchArea: [],
          interpretation: '',
          outsideModel: '',
          contextLimitation: '',
          followUpNeeded: false
        },
        initialFields || {}
      );

      entriesStore.add(entry);

      tx.oncomplete = () => resolve(entry);
      tx.onerror = () => reject(tx.error);
    };

    counterRequest.onerror = () => reject(counterRequest.error);
  });
}

function updateEntry(db, entry) {
  return new Promise((resolve, reject) => {
    const toSave = Object.assign({}, entry, { updatedAt: new Date().toISOString() });
    const tx = db.transaction('entries', 'readwrite');
    tx.objectStore('entries').put(toSave);
    tx.oncomplete = () => resolve(toSave);
    tx.onerror = () => reject(tx.error);
  });
}

function getEntry(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readonly');
    const request = tx.objectStore('entries').get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function getAllEntries(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readonly');
    const request = tx.objectStore('entries').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function deleteEntry(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readwrite');
    tx.objectStore('entries').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// An entry counts as "complete" once the only two universally required
// fields (spec 7: evidence type, direct evidence) are filled in.
function isEntryComplete(entry) {
  return Boolean(entry.evidenceType) && Boolean(entry.directEvidence && entry.directEvidence.trim());
}
