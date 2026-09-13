// Cosmonauts UX Research Field Evidence Logger — app controller.
// No framework, no build step, so this can sit on GitHub Pages as-is.

let db = null;
let currentEntry = null; // the entry object currently open in the form, if any
let saveTimer = null;
let toastTimer = null;
let pendingDeleteTimers = {}; // id -> setTimeout handle, for undo

const els = {
  title: document.getElementById('screen-title'),
  backBtn: document.getElementById('btn-back'),
  views: {
    home: document.getElementById('view-home'),
    form: document.getElementById('view-form'),
    saved: document.getElementById('view-saved'),
    exportView: document.getElementById('view-export'),
    guide: document.getElementById('view-guide')
  },
  toast: document.getElementById('toast')
};

// ---------- small utilities ----------

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function showToast(message, actionLabel, actionFn, duration) {
  clearTimeout(toastTimer);
  els.toast.innerHTML = '';
  els.toast.appendChild(el('<span>' + message + '</span>'));
  if (actionLabel && actionFn) {
    const btn = el('<button type="button" class="toast-action">' + actionLabel + '</button>');
    btn.addEventListener('click', () => {
      actionFn();
      hideToast();
    });
    els.toast.appendChild(btn);
  }
  els.toast.hidden = false;
  toastTimer = setTimeout(hideToast, duration || 5000);
}

function hideToast() {
  els.toast.hidden = true;
  clearTimeout(toastTimer);
}

function showFieldError(container, message) {
  let banner = container.querySelector('.save-error');
  if (!banner) {
    banner = el('<div class="save-error" role="alert"></div>');
    container.prepend(banner);
  }
  banner.textContent = message;
}

function clearFieldError(container) {
  const banner = container.querySelector('.save-error');
  if (banner) banner.remove();
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// ---------- chip group helper ----------
// Renders a row of tap-friendly buttons for single- or multi-select fields.
// Bigger and faster to hit than a native <select>, per the spec's own UI rule.

function renderChipGroup(container, options, currentValue, multi, onSelect) {
  container.innerHTML = '';
  options.forEach((opt) => {
    const isSelected = multi
      ? (currentValue || []).includes(opt.value)
      : currentValue === opt.value;
    const btn = el('<button type="button" class="chip">' + opt.label + '</button>');
    btn.setAttribute('aria-pressed', String(isSelected));
    if (isSelected) btn.classList.add('chip--selected');
    btn.addEventListener('click', () => {
      if (multi) {
        const arr = (currentValue || []).slice();
        const idx = arr.indexOf(opt.value);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(opt.value);
        onSelect(arr);
      } else {
        onSelect(currentValue === opt.value ? '' : opt.value);
      }
    });
    container.appendChild(btn);
  });
}

function makeChipField(containerEl, options, multi, getValue, setValue) {
  function paint() {
    renderChipGroup(containerEl, options, getValue(), multi, (val) => {
      setValue(val);
      scheduleSave();
      paint();
    });
  }
  paint();
  return paint;
}

// ---------- autosave ----------

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 600);
}

async function flushSave() {
  clearTimeout(saveTimer);
  if (!currentEntry) return true;
  const entryBeingSaved = currentEntry;
  try {
    const savedEntry = await updateEntry(db, entryBeingSaved);
    if (currentEntry && currentEntry.id === savedEntry.id) currentEntry = savedEntry;
    clearFieldError(els.views.form);
    return true;
  } catch (err) {
    showFieldError(els.views.form, 'Could not save locally. Your text is still here — try again in a moment.');
    return false;
  }
}

// Flush immediately if the tab is hidden or the app is closed, so nothing
// typed in the last half-second is lost.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushSave();
});
window.addEventListener('pagehide', flushSave);

// ---------- routing ----------

function setActiveView(name, title, showBack) {
  Object.keys(els.views).forEach((key) => {
    els.views[key].hidden = key !== name;
  });
  els.title.textContent = title;
  els.backBtn.hidden = !showBack;
}

async function router() {
  const hash = location.hash || '#/home';

  // Do not leave an entry, or claim it was saved, if IndexedDB rejected the write.
  if (currentEntry && hash !== '#/entry/' + currentEntry.id) {
    const saved = await flushSave();
    if (!saved) {
      history.replaceState(null, '', '#/entry/' + currentEntry.id);
      return;
    }
    currentEntry = null;
  }

  if (hash === '#/new') {
    const entry = await createEntry(db, {});
    history.replaceState(null, '', '#/entry/' + entry.id);
    renderEntryForm(entry, 'create');
    return;
  }

  const entryMatch = hash.match(/^#\/entry\/([^/]+)$/);
  if (entryMatch) {
    const entry = await getEntry(db, entryMatch[1]);
    if (!entry) { location.hash = '#/home'; return; }
    renderEntryForm(entry, 'review');
    return;
  }

  if (hash === '#/saved') { await renderSavedList(); return; }
  if (hash === '#/export') { await renderExportView(); return; }
  if (hash === '#/guide') { renderQuestionGuide(); return; }

  await renderHome();
}

window.addEventListener('hashchange', router);
document.getElementById('btn-back').addEventListener('click', () => {
  location.hash = '#/home';
});

// ---------- home ----------

async function renderHome() {
  setActiveView('home', 'Cosmonauts UX Research Field Evidence Logger', false);
  const container = els.views.home;
  container.innerHTML = '';

  const entries = await getAllEntries(db);
  const visible = entries.filter((e) => !e.deleted);

  container.appendChild(el(
    '<button type="button" id="home-new" class="btn btn-primary btn-block">New entry</button>'
  ));
  container.appendChild(el(
    '<button type="button" id="home-guide" class="btn btn-secondary btn-block home-guide">Question guide</button>'
  ));
  const row = el('<div class="home-row"></div>');
  row.appendChild(el('<button type="button" id="home-saved" class="btn btn-secondary">Saved entries</button>'));
  row.appendChild(el('<button type="button" id="home-export" class="btn btn-secondary">Export</button>'));
  container.appendChild(row);

  container.appendChild(el(
    '<p class="status-line">' + visible.length + ' entr' + (visible.length === 1 ? 'y' : 'ies') + ' saved on this device</p>'
  ));

  const offlineNote = el('<p class="offline-note"></p>');
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    offlineNote.textContent = '✓ Ready to work offline';
    offlineNote.classList.add('offline-note--ready');
  } else {
    offlineNote.textContent = 'Finishing setup — open this app once more while online, then it will work offline.';
  }
  container.appendChild(offlineNote);

  document.getElementById('home-new').addEventListener('click', () => { location.hash = '#/new'; });
  document.getElementById('home-guide').addEventListener('click', () => { location.hash = '#/guide'; });
  document.getElementById('home-saved').addEventListener('click', () => { location.hash = '#/saved'; });
  document.getElementById('home-export').addEventListener('click', () => { location.hash = '#/export'; });
}

// ---------- question guide ----------

function renderQuestionGuide() {
  setActiveView('guide', 'Question guide', true);
  const container = els.views.guide;
  container.innerHTML = '';
  container.appendChild(el(
    '<div class="workflow-note"><strong>Choose one mode at a time: talking or watching.</strong>' +
      '<span>Switch between them across the event. Fill in what you can after stepping away, and leave unseen behaviour blank.</span></div>'
  ));
  container.appendChild(el(
    '<section class="question-card question-card--primary"><p class="eyebrow">Primary question</p>' +
      '<p>How do you decide who\'s worth speaking to at an event like this?</p></section>'
  ));
  container.appendChild(el(
    '<section class="guide-section"><h2>Secondary questions</h2>' +
      '<p>Do you come to events with particular people or organisations in mind? How do you decide who they are?</p>' +
      '<p>Once you meet someone useful, what do you do with that information during the event and afterwards?</p></section>'
  ));

  const probeGroups = [
    ['How sponsors decide who to approach', [
      'Are existing customers or existing relationships important?',
      'What makes one person a higher priority than another?',
      'If several people seem relevant, how do you choose?',
      'Roughly how many useful conversations are you hoping to have?'
    ]],
    ['How sponsors define who they want to meet', [
      'What characteristics matter most?',
      'Are there different types of people or organisations you\'re looking for?',
      'Is there anyone you specifically want to avoid or exclude?',
      'How specific are those criteria before the event?',
      'Is this written down anywhere or mostly something you know?',
      'Do you share those criteria with organisers or other people?'
    ]],
    ['What makes somebody genuinely relevant', [
      'What information makes you confident they\'re worth approaching?',
      'What do you normally want to know about them?',
      'Is there anything you check first?',
      'What would make you decide they weren\'t relevant after all?',
      'Do you need to understand why someone has been suggested or recommended to you?'
    ]],
    ['How sponsors work during events', [
      'Do you take notes? What do you use to record them?',
      'Does LinkedIn enter the process at all?',
      'Do you message people during the event?',
      'Does information move between different tools?',
      'Do colleagues coordinate who they speak to?'
    ]],
    ['What happens afterwards', [
      'Who follows up? Where do the details or notes go?',
      'Do they end up in a CRM, spreadsheet or somewhere else?',
      'Is anything copied or re-entered manually?',
      'What information tends to get kept, and what tends to get forgotten?'
    ]]
  ];
  const probes = el('<section class="guide-section"><h2>Optional probes</h2><p class="hint">Follow the interesting behaviour. Don\'t try to complete the guide.</p></section>');
  probeGroups.forEach((group) => {
    const details = el('<details class="probe-group"><summary></summary><ul></ul></details>');
    details.querySelector('summary').textContent = group[0];
    group[1].forEach((question) => {
      const item = document.createElement('li');
      item.textContent = question;
      details.querySelector('ul').appendChild(item);
    });
    probes.appendChild(details);
  });
  container.appendChild(probes);
  container.appendChild(el(
    '<p class="scope-note"><strong>Scope:</strong> pre-use, general-behaviour discovery only. No product screens and no product-specific testing at this stage.</p>'
  ));
}

// ---------- entry form (create + review/expand) ----------

function renderEntryForm(entry, mode) {
  currentEntry = entry;
  setActiveView('form', mode === 'create' ? 'New entry' : 'Entry ' + entry.id, true);
  const container = els.views.form;
  container.innerHTML = '';

  container.appendChild(el(
    '<div class="workflow-note"><strong>Use one mode for this entry.</strong>' +
      '<span>Talk or watch, then capture what you can after stepping away. Leave anything unseen blank.</span></div>'
  ));

  container.appendChild(el(
    '<div class="field">' +
      '<label>Capture mode</label>' +
      '<div id="f-captureMode" class="chip-row"></div>' +
    '</div>'
  ));
  makeChipField(
    document.getElementById('f-captureMode'), CAPTURE_MODES, false,
    () => currentEntry.captureMode, (value) => { currentEntry.captureMode = value; }
  );

  container.appendChild(el(
    '<div class="field">' +
      '<label for="f-directEvidence">What was observed or said</label>' +
      '<textarea id="f-directEvidence" rows="4" placeholder="Concrete words or behaviour. Don\'t add names, contact details or your interpretation."></textarea>' +
    '</div>'
  ));
  const directEl = document.getElementById('f-directEvidence');
  directEl.value = currentEntry.directEvidence || '';
  directEl.addEventListener('input', () => { currentEntry.directEvidence = directEl.value; scheduleSave(); });

  const contextDetails = el(
    '<details class="context-block"' + (mode === 'review' ? ' open' : '') + '>' +
      '<summary>Participant context</summary>' +
      '<p class="hint">Use categories only. Don\'t record names, named accounts or contact details.</p>' +
      '<div class="field"><label>Participant role</label><div id="f-role" class="chip-row"></div></div>' +
      '<div class="field"><label>Organisation type</label><div id="f-org" class="chip-row"></div></div>' +
      '<div class="field"><label>Event objective</label><div id="f-objective" class="chip-row"></div></div>' +
      '<div class="field"><label>Responsible for outreach or networking</label><div id="f-outreach" class="chip-row"></div></div>' +
      '<div class="field"><label>When this happened</label><div id="f-timing" class="chip-row"></div></div>' +
    '</details>'
  );
  container.appendChild(contextDetails);

  makeChipField(document.getElementById('f-role'), PARTICIPANT_ROLES, false,
    () => currentEntry.participantRole, (value) => currentEntry.participantRole = value);
  makeChipField(document.getElementById('f-org'), ORG_TYPES, false,
    () => currentEntry.orgType, (value) => currentEntry.orgType = value);
  makeChipField(document.getElementById('f-objective'), EVENT_OBJECTIVES, true,
    () => currentEntry.eventObjective, (value) => currentEntry.eventObjective = value);
  makeChipField(document.getElementById('f-outreach'), OUTREACH_RESPONSIBILITY, false,
    () => currentEntry.outreachResponsibility, (value) => currentEntry.outreachResponsibility = value);
  makeChipField(document.getElementById('f-timing'), WORKFLOW_TIMINGS, true,
    () => currentEntry.workflowTiming, (value) => currentEntry.workflowTiming = value);

  if (mode === 'review') {
    const expansion = el(
      '<div class="expansion-block">' +
        '<h2 class="section-heading">Structure after capture</h2>' +
        '<p class="hint">Complete only what you observed or established. Blank is better than a guess.</p>' +
        '<details class="measure-block" open><summary>Evidence grounding</summary>' +
          '<div class="field"><label for="f-recentExample">Recent example discussed</label><textarea id="f-recentExample" rows="3" placeholder="Optional"></textarea></div>' +
          '<div class="field"><label>Research area</label><div id="f-researchArea" class="chip-row"></div></div>' +
          '<div class="field field--confirmed"><label for="f-confirmedExplanation">Confirmed by participant</label><textarea id="f-confirmedExplanation" rows="3" placeholder="What they said the observed behaviour meant. Leave blank unless established."></textarea></div>' +
          '<div class="field"><label for="f-contextLimitation">Context or limitation</label><textarea id="f-contextLimitation" rows="2" placeholder="Noise, second-hand account, interruption, ambiguity..."></textarea></div>' +
          '<div class="field field--interpretation"><label for="f-interpretation">Your interpretation</label><textarea id="f-interpretation" rows="3" placeholder="A provisional read, kept separate from the evidence."></textarea></div>' +
          '<div id="f-legacy-wrap" class="field" hidden><label for="f-legacyNotes">Notes preserved from an earlier version</label><textarea id="f-legacyNotes" rows="3" readonly></textarea></div>' +
        '</details>' +
        '<details class="measure-block"><summary>Targeting behaviour</summary>' +
          '<p class="hint">Record target categories, never actual names or named accounts.</p>' +
          '<div class="field"><label>Target type</label><div id="f-targetType" class="chip-row"></div></div>' +
          '<div class="field"><label>How target was identified</label><div id="f-targetIdentifiedBy" class="chip-row"></div></div>' +
          '<div class="field"><label>Existing relationship involved</label><div id="f-relationshipType" class="chip-row"></div></div>' +
          '<div class="field"><label>Main relevance criteria mentioned</label><div id="f-relevanceCriteria" class="chip-row"></div></div>' +
        '</details>' +
        '<details class="measure-block"><summary>Event workflow</summary>' +
          '<div class="field"><label>Introduction initiated by</label><div id="f-introductionInitiatedBy" class="chip-row"></div></div>' +
          '<div class="field"><label>Information captured</label><div id="f-informationCaptured" class="chip-row"></div></div>' +
          '<div class="field"><label>Capture method</label><div id="f-captureMethod" class="chip-row"></div></div>' +
          '<div class="field"><label>Information transferred between tools</label><div id="f-informationTransferred" class="chip-row"></div></div>' +
        '</details>' +
        '<details class="measure-block"><summary>Device use</summary>' +
          '<div class="field"><label>Device used</label><div id="f-deviceUsed" class="chip-row"></div></div>' +
          '<div class="field"><label>When used</label><div id="f-deviceTiming" class="chip-row"></div></div>' +
          '<div class="field"><label>Purpose, only where known</label><div id="f-devicePurpose" class="chip-row"></div></div>' +
        '</details>' +
        '<details class="measure-block"><summary>Follow-up behaviour</summary>' +
          '<div class="field"><label>Follow-up channel</label><div id="f-followUpChannel" class="chip-row"></div></div>' +
          '<div class="field"><label>Information destination</label><div id="f-informationDestination" class="chip-row"></div></div>' +
          '<div class="field"><label>Follow-up owner</label><div id="f-followUpOwner" class="chip-row"></div></div>' +
        '</details>' +
        '<div class="field status-field"><label>Entry status</label><div id="f-status" class="chip-row"></div></div>' +
      '</div>'
    );
    container.appendChild(expansion);

    [
      ['f-recentExample', 'recentExample'],
      ['f-confirmedExplanation', 'confirmedExplanation'],
      ['f-contextLimitation', 'contextLimitation'],
      ['f-interpretation', 'interpretation']
    ].forEach((binding) => {
      const field = document.getElementById(binding[0]);
      field.value = currentEntry[binding[1]] || '';
      field.addEventListener('input', () => { currentEntry[binding[1]] = field.value; scheduleSave(); });
    });

    if (currentEntry.legacyNotes) {
      document.getElementById('f-legacy-wrap').hidden = false;
      document.getElementById('f-legacyNotes').value = currentEntry.legacyNotes;
    }

    makeChipField(document.getElementById('f-researchArea'), RESEARCH_AREAS, true,
      () => currentEntry.researchArea, (value) => currentEntry.researchArea = value);
    makeChipField(document.getElementById('f-targetType'), TARGET_TYPES, true,
      () => currentEntry.targetType, (value) => currentEntry.targetType = value);
    makeChipField(document.getElementById('f-targetIdentifiedBy'), TARGET_IDENTIFICATION_METHODS, true,
      () => currentEntry.targetIdentifiedBy, (value) => currentEntry.targetIdentifiedBy = value);
    makeChipField(document.getElementById('f-relationshipType'), RELATIONSHIP_TYPES, false,
      () => currentEntry.relationshipType, (value) => currentEntry.relationshipType = value);
    makeChipField(document.getElementById('f-relevanceCriteria'), RELEVANCE_CRITERIA, true,
      () => currentEntry.relevanceCriteria, (value) => currentEntry.relevanceCriteria = value);
    makeChipField(document.getElementById('f-introductionInitiatedBy'), INTRODUCTION_INITIATORS, false,
      () => currentEntry.introductionInitiatedBy, (value) => currentEntry.introductionInitiatedBy = value);
    makeChipField(document.getElementById('f-informationCaptured'), INFORMATION_CAPTURED, true,
      () => currentEntry.informationCaptured, (value) => currentEntry.informationCaptured = value);
    makeChipField(document.getElementById('f-captureMethod'), CAPTURE_METHODS, true,
      () => currentEntry.captureMethod, (value) => currentEntry.captureMethod = value);
    makeChipField(document.getElementById('f-informationTransferred'), TRANSFER_OPTIONS, false,
      () => currentEntry.informationTransferred, (value) => currentEntry.informationTransferred = value);
    makeChipField(document.getElementById('f-deviceUsed'), DEVICES_USED, true,
      () => currentEntry.deviceUsed, (value) => currentEntry.deviceUsed = value);
    makeChipField(document.getElementById('f-deviceTiming'), DEVICE_TIMINGS, true,
      () => currentEntry.deviceTiming, (value) => currentEntry.deviceTiming = value);
    makeChipField(document.getElementById('f-devicePurpose'), DEVICE_PURPOSES, true,
      () => currentEntry.devicePurpose, (value) => currentEntry.devicePurpose = value);
    makeChipField(document.getElementById('f-followUpChannel'), FOLLOW_UP_CHANNELS, true,
      () => currentEntry.followUpChannel, (value) => currentEntry.followUpChannel = value);
    makeChipField(document.getElementById('f-informationDestination'), INFORMATION_DESTINATIONS, true,
      () => currentEntry.informationDestination, (value) => currentEntry.informationDestination = value);
    makeChipField(document.getElementById('f-followUpOwner'), FOLLOW_UP_OWNERS, false,
      () => currentEntry.followUpOwner, (value) => currentEntry.followUpOwner = value);
    makeChipField(document.getElementById('f-status'), ENTRY_STATUSES, false,
      () => currentEntry.status, (value) => currentEntry.status = value || currentEntry.status);
  }

  const saveBar = el(
    '<div class="save-bar">' +
      '<button type="button" id="f-save" class="btn btn-primary btn-block">Save locally</button>' +
    '</div>'
  );
  container.appendChild(saveBar);

  let saving = false;
  document.getElementById('f-save').addEventListener('click', async () => {
    if (saving) return;
    saving = true;
    if (mode === 'create' && isEntryComplete(currentEntry) && currentEntry.status === 'rapid_note') {
      // stays "rapid_note" — that is the correct resting status for a freshly captured entry
    }
    const saved = await flushSave();
    saving = false;
    if (!saved) return;
    currentEntry = null;
    showToast('Saved locally.');
    location.hash = '#/home';
  });
}

// ---------- saved entries ----------

let savedFilters = { mode: 'all', status: 'all', query: '' };

async function renderSavedList() {
  setActiveView('saved', 'Saved entries', true);
  const container = els.views.saved;
  container.innerHTML = '';

  const searchWrap = el(
    '<div class="field"><label for="s-search">Search entries</label>' +
      '<input id="s-search" type="search" placeholder="Search evidence text" /></div>'
  );
  container.appendChild(searchWrap);

  const modeFilterRow = el('<div id="s-mode-filter" class="chip-row"></div>');
  container.appendChild(modeFilterRow);
  const statusFilterRow = el('<div id="s-status-filter" class="chip-row"></div>');
  container.appendChild(statusFilterRow);

  const listEl = el('<div id="s-list" class="entry-list"></div>');
  container.appendChild(listEl);

  document.getElementById('s-search').value = savedFilters.query;
  document.getElementById('s-search').addEventListener('input', (e) => {
    savedFilters.query = e.target.value;
    paintList();
  });

  const modeOptions = [{ value: 'all', label: 'All' }].concat(CAPTURE_MODES);
  function paintModeFilter() {
    renderChipGroup(modeFilterRow, modeOptions, savedFilters.mode, false, (value) => {
      savedFilters.mode = value || 'all';
      paintModeFilter();
      paintList();
    });
  }
  paintModeFilter();

  const statusOptions = [{ value: 'all', label: 'All statuses' }].concat(ENTRY_STATUSES);
  function paintStatusFilter() {
    renderChipGroup(statusFilterRow, statusOptions, savedFilters.status, false, (v) => {
      savedFilters.status = v || 'all';
      paintStatusFilter();
      paintList();
    });
  }
  paintStatusFilter();

  async function paintList() {
    const all = await getAllEntries(db);
    const q = savedFilters.query.trim().toLowerCase();
    const rows = all
      .filter((e) => !e.deleted)
      .filter((e) => savedFilters.mode === 'all' || e.captureMode === savedFilters.mode)
      .filter((e) => savedFilters.status === 'all' || e.status === savedFilters.status)
      .filter((e) => {
        if (!q) return true;
        const haystack = [
          e.directEvidence, e.recentExample, e.confirmedExplanation,
          e.interpretation, e.contextLimitation, e.legacyNotes
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    listEl.innerHTML = '';
    if (!rows.length) {
      listEl.appendChild(el('<p class="empty-state">No entries match. Try clearing filters.</p>'));
      return;
    }

    rows.forEach((entry) => {
      const row = el(
        '<div class="entry-row">' +
          '<button type="button" class="entry-row-main">' +
            '<span class="mono"></span>' +
            '<span class="badge entry-type"></span>' +
            '<span class="badge badge--status"></span>' +
            '<span class="entry-row-text"></span>' +
          '</button>' +
          '<button type="button" class="icon-btn entry-delete" aria-label="Delete entry">Delete</button>' +
        '</div>'
      );
      row.dataset.id = entry.id;
      row.querySelector('.mono').textContent = entry.id + ' \u00b7 ' + formatDateTime(entry.createdAt);
      row.querySelector('.entry-type').textContent = labelFor(CAPTURE_MODES, entry.captureMode);
      row.querySelector('.badge--status').textContent = labelFor(ENTRY_STATUSES, entry.status);
      row.querySelector('.entry-row-text').textContent = entry.directEvidence || '(no direct evidence recorded yet)';
      row.querySelector('.entry-row-main').addEventListener('click', () => {
        location.hash = '#/entry/' + entry.id;
      });
      row.querySelector('.entry-delete').addEventListener('click', (ev) => {
        ev.stopPropagation();
        confirmDeleteRow(row, entry, paintList);
      });
      listEl.appendChild(row);
    });
  }

  paintList();
}

function confirmDeleteRow(rowEl, entry, refreshFn) {
  if (rowEl.querySelector('.confirm-row')) return;
  const confirmBar = el(
    '<div class="confirm-row">' +
      '<span>Delete this entry?</span>' +
      '<button type="button" class="btn-text confirm-cancel">Cancel</button>' +
      '<button type="button" class="btn-text confirm-delete">Delete</button>' +
    '</div>'
  );
  rowEl.appendChild(confirmBar);
  confirmBar.querySelector('.confirm-cancel').addEventListener('click', () => confirmBar.remove());
  confirmBar.querySelector('.confirm-delete').addEventListener('click', async () => {
    entry.deleted = true;
    entry.deletedAt = new Date().toISOString();
    await updateEntry(db, entry);
    refreshFn();
    showToast('Entry deleted.', 'Undo', async () => {
      clearTimeout(pendingDeleteTimers[entry.id]);
      entry.deleted = false;
      delete entry.deletedAt;
      await updateEntry(db, entry);
      refreshFn();
    }, 6000);
    pendingDeleteTimers[entry.id] = setTimeout(async () => {
      const fresh = await getEntry(db, entry.id);
      if (fresh && fresh.deleted) await deleteEntry(db, entry.id);
    }, 6500);
  });
}

// Sweep up anything left "deleted" from a previous session where the app
// closed before the undo window ran out.
async function purgeStaleDeletes() {
  const all = await getAllEntries(db);
  const now = Date.now();
  for (const e of all) {
    if (e.deleted && e.deletedAt && now - new Date(e.deletedAt).getTime() > 60000) {
      await deleteEntry(db, e.id);
    }
  }
}

// ---------- export ----------

async function renderExportView() {
  setActiveView('exportView', 'Export', true);
  const container = els.views.exportView;
  container.innerHTML = '';

  const all = (await getAllEntries(db)).filter((e) => !e.deleted);
  const complete = all.filter(isEntryComplete);
  const incomplete = all.length - complete.length;

  container.appendChild(el(
    '<p class="status-line">' + all.length + ' entries on this device \u2014 ' +
    incomplete + ' incomplete.</p>'
  ));
  container.appendChild(el(
    '<p class="hint">Exports include the full research record. Handle the file the way you would any research evidence.</p>'
  ));

  container.appendChild(el(
    '<div class="field"><label for="e-label">Event label (used in the filename)</label>' +
    '<input id="e-label" type="text" placeholder="e.g. frankfurt-2026" /></div>'
  ));
  const labelInput = document.getElementById('e-label');
  labelInput.value = getEventLabel() === 'event' ? '' : getEventLabel();
  labelInput.addEventListener('input', () => setEventLabel(labelInput.value));

  const csvBtn = el('<button type="button" class="btn btn-primary btn-block">Export CSV</button>');
  const jsonBtn = el('<button type="button" class="btn btn-secondary btn-block">Export JSON backup</button>');
  container.appendChild(csvBtn);
  container.appendChild(jsonBtn);

  csvBtn.addEventListener('click', () => { exportCsv(all); showToast('CSV exported.'); });
  jsonBtn.addEventListener('click', () => { exportJson(all); showToast('JSON backup exported.'); });
}

// ---------- boot ----------

async function boot() {
  try {
    // Recover cleanly if an interrupted deployment left an older app shell cached.
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('curfel-') && name !== 'curfel-v5')
          .map((name) => caches.delete(name))
      );
    }
    db = await openDatabase();
  } catch (err) {
    document.body.innerHTML = '<p class="save-error" role="alert">This device could not open local storage. The app cannot run without it.</p>';
    return;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=5').catch(() => { /* still usable online-only this run */ });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!location.hash || location.hash === '#/home') renderHome();
    });
  }

  // Ask the browser to protect unexported evidence from routine storage eviction.
  // Some browsers decide this automatically, so a refusal is not a fatal error.
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => { /* continue with best-effort storage */ });
  }

  await purgeStaleDeletes();
  await router();
}

boot();
