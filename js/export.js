// Turns stored entries into downloadable files. No network call is made.

const CSV_COLUMNS = [
  'id', 'createdAt', 'updatedAt', 'status', 'source', 'captureMode',
  'participantRole', 'orgType', 'eventObjective', 'outreachResponsibility',
  'workflowTiming', 'directEvidence', 'recentExample', 'researchArea',
  'confirmedExplanation', 'interpretation', 'contextLimitation',
  'targetType', 'targetIdentifiedBy', 'relationshipType', 'relevanceCriteria',
  'introductionInitiatedBy', 'informationCaptured', 'captureMethod',
  'informationTransferred', 'deviceUsed', 'deviceTiming', 'devicePurpose',
  'followUpChannel', 'informationDestination', 'followUpOwner', 'legacyNotes'
];

function csvEscape(value) {
  let stringValue = value === undefined || value === null ? '' : String(value);
  if (/^[=+\-@]/.test(stringValue)) stringValue = "'" + stringValue;
  if (/[",\n\r]/.test(stringValue)) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}

function entryToCsvRow(entry) {
  const row = {
    id: entry.id,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    status: labelFor(ENTRY_STATUSES, entry.status),
    source: entry.source === 'paper_fallback' ? 'Paper fallback' : 'App',
    captureMode: labelFor(CAPTURE_MODES, entry.captureMode),
    participantRole: labelFor(PARTICIPANT_ROLES, entry.participantRole),
    orgType: labelFor(ORG_TYPES, entry.orgType),
    eventObjective: labelsFor(EVENT_OBJECTIVES, entry.eventObjective),
    outreachResponsibility: labelFor(OUTREACH_RESPONSIBILITY, entry.outreachResponsibility),
    workflowTiming: labelsFor(WORKFLOW_TIMINGS, entry.workflowTiming),
    directEvidence: entry.directEvidence,
    recentExample: entry.recentExample,
    researchArea: labelsFor(RESEARCH_AREAS, entry.researchArea),
    confirmedExplanation: entry.confirmedExplanation,
    interpretation: entry.interpretation,
    contextLimitation: entry.contextLimitation,
    targetType: labelsFor(TARGET_TYPES, entry.targetType),
    targetIdentifiedBy: labelsFor(TARGET_IDENTIFICATION_METHODS, entry.targetIdentifiedBy),
    relationshipType: labelFor(RELATIONSHIP_TYPES, entry.relationshipType),
    relevanceCriteria: labelsFor(RELEVANCE_CRITERIA, entry.relevanceCriteria),
    introductionInitiatedBy: labelFor(INTRODUCTION_INITIATORS, entry.introductionInitiatedBy),
    informationCaptured: labelsFor(INFORMATION_CAPTURED, entry.informationCaptured),
    captureMethod: labelsFor(CAPTURE_METHODS, entry.captureMethod),
    informationTransferred: labelFor(TRANSFER_OPTIONS, entry.informationTransferred),
    deviceUsed: labelsFor(DEVICES_USED, entry.deviceUsed),
    deviceTiming: labelsFor(DEVICE_TIMINGS, entry.deviceTiming),
    devicePurpose: labelsFor(DEVICE_PURPOSES, entry.devicePurpose),
    followUpChannel: labelsFor(FOLLOW_UP_CHANNELS, entry.followUpChannel),
    informationDestination: labelsFor(INFORMATION_DESTINATIONS, entry.informationDestination),
    followUpOwner: labelFor(FOLLOW_UP_OWNERS, entry.followUpOwner),
    legacyNotes: entry.legacyNotes
  };
  return CSV_COLUMNS.map((column) => csvEscape(row[column])).join(',');
}

function buildCsv(entries) {
  const header = CSV_COLUMNS.join(',');
  return [header].concat(entries.map(entryToCsvRow)).join('\r\n');
}

function buildJson(entries) {
  const cleanEntries = entries.map((entry) => {
    const cleanEntry = {};
    ENTRY_FIELDS.forEach((key) => {
      if (entry[key] !== undefined) cleanEntry[key] = entry[key];
    });
    return cleanEntry;
  });
  return JSON.stringify(cleanEntries, null, 2);
}

function getEventLabel() {
  return localStorage.getItem('curfel_eventLabel') || 'event';
}

function setEventLabel(label) {
  localStorage.setItem('curfel_eventLabel', label || 'event');
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'event';
}

function timestampForFilename() {
  const date = new Date();
  const pad2 = (number) => String(number).padStart(2, '0');
  return date.getFullYear() + pad2(date.getMonth() + 1) + pad2(date.getDate()) +
    '-' + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function exportCsv(entries) {
  const filename = 'cosmonauts-ux-research-evidence_' + slugify(getEventLabel()) + '_' + timestampForFilename() + '.csv';
  downloadFile(filename, buildCsv(entries), 'text/csv;charset=utf-8');
}

function exportJson(entries) {
  const filename = 'cosmonauts-ux-research-evidence_' + slugify(getEventLabel()) + '_' + timestampForFilename() + '.json';
  downloadFile(filename, buildJson(entries), 'application/json;charset=utf-8');
}
