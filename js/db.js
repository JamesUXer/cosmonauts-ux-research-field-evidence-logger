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
// Local storage layer. Everything stays in IndexedDB on this device.

const DB_NAME = 'cosmonautsUxResearchFieldEvidenceDB';
const DB_VERSION = 3;
const ENTRY_FIELDS = [
  'id', 'createdAt', 'updatedAt', 'status', 'source', 'captureMode',
  'participantRole', 'orgType', 'eventObjective', 'outreachResponsibility',
  'workflowTiming', 'directEvidence', 'recentExample', 'researchArea',
  'confirmedExplanation', 'interpretation', 'contextLimitation',
  'targetType', 'targetIdentifiedBy', 'relationshipType', 'relevanceCriteria',
  'introductionInitiatedBy', 'informationCaptured', 'captureMethod',
  'informationTransferred', 'deviceUsed', 'deviceTiming', 'devicePurpose',
  'followUpChannel', 'informationDestination', 'followUpOwner', 'legacyNotes',
  'deleted', 'deletedAt'
];

const ARRAY_FIELDS = [
  'eventObjective', 'workflowTiming', 'researchArea', 'targetType',
  'targetIdentifiedBy', 'relevanceCriteria', 'informationCaptured',
  'captureMethod', 'deviceUsed', 'deviceTiming', 'devicePurpose',
  'followUpChannel', 'informationDestination'
];

function appendLegacyNote(entry, label, value) {
  if (!value) return;
  const note = label + ': ' + value;
  entry.legacyNotes = entry.legacyNotes ? entry.legacyNotes + '\n' + note : note;
}

function migrateEntry(entry) {
  if (!entry.captureMode && entry.evidenceType) entry.captureMode = entry.evidenceType;
  if (!entry.orgType && entry.orgContext) entry.orgType = entry.orgContext;
  if (!entry.outreachResponsibility && entry.outreach) entry.outreachResponsibility = entry.outreach;
  if ((!entry.workflowTiming || !entry.workflowTiming.length) && entry.workflowStage) {
    const timingMap = {
      before: 'before_interaction',
      during: 'during_interaction',
      after_conversation: 'immediately_after',
      after_event: 'after_event',
      cross_stage: 'cross_stage',
      unclear: 'unclear'
    };
    entry.workflowTiming = entry.workflowStage.map((value) => timingMap[value] || value);
  }
  if (entry.researchArea) {
    entry.researchArea = entry.researchArea.map((value) => value === 'judging_match' ? 'judging_relevance' : value);
  }
  appendLegacyNote(entry, 'Previous out-of-scope note', entry.outsideModel);
  if (entry.followUpNeeded) appendLegacyNote(entry, 'Previous follow-up flag', 'Yes');

  ARRAY_FIELDS.forEach((field) => {
    if (!Array.isArray(entry[field])) entry[field] = [];
  });
  ENTRY_FIELDS.forEach((field) => {
    if (entry[field] === undefined && !ARRAY_FIELDS.includes(field)) entry[field] = '';
  });
  Object.keys(entry).forEach((key) => {
    if (!ENTRY_FIELDS.includes(key)) delete entry[key];
  });
  return entry;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains('entries')) {
        database.createObjectStore('entries', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('meta')) {
        database.createObjectStore('meta', { keyPath: 'key' });
      }
      const entriesStore = event.target.transaction.objectStore('entries');
      const cursorRequest = entriesStore.openCursor();
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        cursor.update(migrateEntry(cursor.value));
        cursor.continue();
      };
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function pad(num, size) {
  let value = String(num);
  while (value.length < size) value = '0' + value;
  return value;
}

function createEntry(database, initialFields) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['meta', 'entries'], 'readwrite');
    const metaStore = transaction.objectStore('meta');
    const entriesStore = transaction.objectStore('entries');
    const counterRequest = metaStore.get('entryCounter');
    counterRequest.onsuccess = () => {
      const current = counterRequest.result ? counterRequest.result.value : 0;
      const next = current + 1;
      metaStore.put({ key: 'entryCounter', value: next });
      const now = new Date().toISOString();
      const entry = migrateEntry(Object.assign({
        id: 'E-' + pad(next, 3),
        createdAt: now,
        updatedAt: now,
        status: 'rapid_note',
        source: 'app'
      }, initialFields || {}));
      entriesStore.add(entry);
      transaction.oncomplete = () => resolve(entry);
      transaction.onerror = () => reject(transaction.error);
    };
    counterRequest.onerror = () => reject(counterRequest.error);
  });
}

function updateEntry(database, entry) {
  return new Promise((resolve, reject) => {
    const toSave = Object.assign({}, entry, { updatedAt: new Date().toISOString() });
    const transaction = database.transaction('entries', 'readwrite');
    transaction.objectStore('entries').put(toSave);
    transaction.oncomplete = () => resolve(toSave);
    transaction.onerror = () => reject(transaction.error);
  });
}

function getEntry(database, id) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readonly');
    const request = transaction.objectStore('entries').get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (event) => reject(event.target.error);
  });
}

function getAllEntries(database) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readonly');
    const request = transaction.objectStore('entries').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (event) => reject(event.target.error);
  });
}

function deleteEntry(database, id) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readwrite');
    transaction.objectStore('entries').delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

function isEntryComplete(entry) {
  return Boolean(entry.captureMode) && Boolean(entry.directEvidence && entry.directEvidence.trim());
}
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
