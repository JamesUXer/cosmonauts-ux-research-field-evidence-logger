// Turns stored entries into downloadable files. No network call of any kind
// — the CSV/JSON is built in memory and handed to the browser as a Blob.

const CSV_COLUMNS = [
  'id', 'createdAt', 'updatedAt', 'status', 'source',
  'evidenceType', 'participantRole', 'orgContext',
  'eventObjective', 'outreach', 'workflowStage', 'directEvidence',
  'recentExample', 'researchArea', 'interpretation', 'outsideModel',
  'contextLimitation', 'followUpNeeded'
];

function csvEscape(value) {
  let str = value === undefined || value === null ? '' : String(value);
  // CSV is often opened in a spreadsheet, where these prefixes can be
  // interpreted as formulas rather than evidence text.
  if (/^[=+\-@]/.test(str)) str = "'" + str;
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function entryToCsvRow(entry) {
  const row = {
    id: entry.id,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    status: labelFor(ENTRY_STATUSES, entry.status),
    source: entry.source === 'paper_fallback' ? 'Source: paper fallback' : 'App',
    evidenceType: labelFor(EVIDENCE_TYPES, entry.evidenceType),
    participantRole: labelFor(PARTICIPANT_ROLES, entry.participantRole),
    orgContext: labelFor(ORG_CONTEXTS, entry.orgContext),
    eventObjective: labelsFor(EVENT_OBJECTIVES, entry.eventObjective),
    outreach: labelFor(OUTREACH_OPTIONS, entry.outreach),
    workflowStage: labelsFor(WORKFLOW_STAGES, entry.workflowStage),
    directEvidence: entry.directEvidence,
    recentExample: entry.recentExample,
    researchArea: labelsFor(RESEARCH_AREAS, entry.researchArea),
    interpretation: entry.interpretation,
    outsideModel: entry.outsideModel,
    contextLimitation: entry.contextLimitation,
    followUpNeeded: entry.followUpNeeded ? 'Yes' : 'No'
  };
  return CSV_COLUMNS.map((col) => csvEscape(row[col])).join(',');
}

function buildCsv(entries) {
  const header = CSV_COLUMNS.join(',');
  const rows = entries.map(entryToCsvRow);
  return [header].concat(rows).join('\r\n');
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
  return localStorage.getItem('pfl_eventLabel') || 'event';
}

function setEventLabel(label) {
  localStorage.setItem('pfl_eventLabel', label || 'event');
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'event';
}

function timestampForFilename() {
  const d = new Date();
  const pad2 = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) +
    '-' + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds())
  );
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Give the browser a moment before revoking, some Android WebViews are slow to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function exportCsv(entries) {
  const filename = 'pathfinder-evidence_' + slugify(getEventLabel()) + '_' + timestampForFilename() + '.csv';
  downloadFile(filename, buildCsv(entries), 'text/csv;charset=utf-8');
}

function exportJson(entries) {
  const filename = 'pathfinder-evidence_' + slugify(getEventLabel()) + '_' + timestampForFilename() + '.json';
  downloadFile(filename, buildJson(entries), 'application/json;charset=utf-8');
}
