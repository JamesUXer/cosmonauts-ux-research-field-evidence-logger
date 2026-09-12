// Pathfinder Field Evidence Logger — app controller.
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
    exportView: document.getElementById('view-export')
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

  await renderHome();
}

window.addEventListener('hashchange', router);
document.getElementById('btn-back').addEventListener('click', () => {
  location.hash = '#/home';
});

// ---------- home ----------

async function renderHome() {
  setActiveView('home', 'Pathfinder Field Evidence Logger', false);
  const container = els.views.home;
  container.innerHTML = '';

  const entries = await getAllEntries(db);
  const visible = entries.filter((e) => !e.deleted);

  container.appendChild(el(
    '<button type="button" id="home-new" class="btn btn-primary btn-block">New entry</button>'
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
  document.getElementById('home-saved').addEventListener('click', () => { location.hash = '#/saved'; });
  document.getElementById('home-export').addEventListener('click', () => { location.hash = '#/export'; });
}

// ---------- entry form (create + review/expand) ----------

function renderEntryForm(entry, mode) {
  currentEntry = entry;
  setActiveView('form', mode === 'create' ? 'New entry' : 'Entry ' + entry.id, true);
  const container = els.views.form;
  container.innerHTML = '';

  container.appendChild(el(
    '<div class="field">' +
      '<label>Evidence type</label>' +
      '<div id="f-evidenceType" class="chip-row"></div>' +
    '</div>'
  ));
  makeChipField(
    document.getElementById('f-evidenceType'), EVIDENCE_TYPES, false,
    () => currentEntry.evidenceType, (v) => { currentEntry.evidenceType = v; }
  );

  container.appendChild(el(
    '<div class="field">' +
      '<label for="f-directEvidence">What was observed or said</label>' +
      '<textarea id="f-directEvidence" rows="4" placeholder="Concrete, specific language — what happened or was said, not what you think it means"></textarea>' +
    '</div>'
  ));
  const directEl = document.getElementById('f-directEvidence');
  directEl.value = currentEntry.directEvidence || '';
  directEl.addEventListener('input', () => { currentEntry.directEvidence = directEl.value; scheduleSave(); });

  // --- context fields: collapsed by default on a brand-new entry ---
  const contextDetails = el(
    '<details class="context-block"' + (mode === 'review' ? ' open' : '') + '>' +
      '<summary>Add more context</summary>' +
      '<div class="field"><label>Participant role</label><div id="f-role" class="chip-row"></div></div>' +
      '<div class="field"><label>Organisation context</label><div id="f-org" class="chip-row"></div></div>' +
      '<div class="field"><label>Event objective</label><div id="f-objective" class="chip-row"></div></div>' +
      '<div class="field"><label>Personally conducts outreach</label><div id="f-outreach" class="chip-row"></div></div>' +
      '<div class="field"><label>Workflow stage</label><div id="f-stage" class="chip-row"></div></div>' +
    '</details>'
  );
  container.appendChild(contextDetails);

  makeChipField(document.getElementById('f-role'), PARTICIPANT_ROLES, false,
    () => currentEntry.participantRole, (v) => currentEntry.participantRole = v);
  makeChipField(document.getElementById('f-org'), ORG_CONTEXTS, false,
    () => currentEntry.orgContext, (v) => currentEntry.orgContext = v);
  makeChipField(document.getElementById('f-objective'), EVENT_OBJECTIVES, true,
    () => currentEntry.eventObjective, (v) => currentEntry.eventObjective = v);
  makeChipField(document.getElementById('f-outreach'), OUTREACH_OPTIONS, false,
    () => currentEntry.outreach, (v) => currentEntry.outreach = v);
  makeChipField(document.getElementById('f-stage'), WORKFLOW_STAGES, true,
    () => currentEntry.workflowStage, (v) => currentEntry.workflowStage = v);

  // --- expansion fields: only shown once the entry is being reviewed/expanded ---
  if (mode === 'review') {
    const expansion = el(
      '<div class="expansion-block">' +
        '<h2 class="section-heading">More detail</h2>' +
        '<div class="field"><label>Recent example discussed</label>' +
          '<textarea id="f-recentExample" rows="3" placeholder="Optional"></textarea></div>' +
        '<div class="field"><label>Research area (organisational tag, not a finding)</label>' +
          '<div id="f-researchArea" class="chip-row"></div></div>' +
        '<div class="field"><label>Context or limitation</label>' +
          '<textarea id="f-contextLimitation" rows="2" placeholder="Noise, second-hand account, interruption, ambiguity..."></textarea></div>' +
        '<div class="field field--interpretation"><label>Your interpretation (kept separate from the record above)</label>' +
          '<textarea id="f-interpretation" rows="3" placeholder="Optional — a provisional read, clearly not the direct evidence"></textarea></div>' +
        '<div class="field"><label>Outside Pathfinder\u2019s current model</label>' +
          '<textarea id="f-outsideModel" rows="2" placeholder="Optional"></textarea></div>' +
        '<div class="field field--inline"><label for="f-followUp">Follow-up needed</label>' +
          '<input id="f-followUp" type="checkbox" /></div>' +
        '<div class="field"><label>Entry status</label><div id="f-status" class="chip-row"></div></div>' +
      '</div>'
    );
    container.appendChild(expansion);

    const recentEl = document.getElementById('f-recentExample');
    recentEl.value = currentEntry.recentExample || '';
    recentEl.addEventListener('input', () => { currentEntry.recentExample = recentEl.value; scheduleSave(); });

    const climEl = document.getElementById('f-contextLimitation');
    climEl.value = currentEntry.contextLimitation || '';
    climEl.addEventListener('input', () => { currentEntry.contextLimitation = climEl.value; scheduleSave(); });

    const interpEl = document.getElementById('f-interpretation');
    interpEl.value = currentEntry.interpretation || '';
    interpEl.addEventListener('input', () => { currentEntry.interpretation = interpEl.value; scheduleSave(); });

    const outsideEl = document.getElementById('f-outsideModel');
    outsideEl.value = currentEntry.outsideModel || '';
    outsideEl.addEventListener('input', () => { currentEntry.outsideModel = outsideEl.value; scheduleSave(); });

    const followEl = document.getElementById('f-followUp');
    followEl.checked = Boolean(currentEntry.followUpNeeded);
    followEl.addEventListener('change', () => { currentEntry.followUpNeeded = followEl.checked; scheduleSave(); });

    makeChipField(document.getElementById('f-researchArea'), RESEARCH_AREAS, true,
      () => currentEntry.researchArea, (v) => currentEntry.researchArea = v);
    makeChipField(document.getElementById('f-status'), ENTRY_STATUSES, false,
      () => currentEntry.status, (v) => currentEntry.status = v || currentEntry.status);
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

let savedFilters = { type: 'all', status: 'all', query: '' };

async function renderSavedList() {
  setActiveView('saved', 'Saved entries', true);
  const container = els.views.saved;
  container.innerHTML = '';

  const searchWrap = el(
    '<div class="field"><label for="s-search">Search entries</label>' +
      '<input id="s-search" type="search" placeholder="Search evidence text" /></div>'
  );
  container.appendChild(searchWrap);

  const typeFilterRow = el('<div id="s-type-filter" class="chip-row"></div>');
  container.appendChild(typeFilterRow);
  const statusFilterRow = el('<div id="s-status-filter" class="chip-row"></div>');
  container.appendChild(statusFilterRow);

  const listEl = el('<div id="s-list" class="entry-list"></div>');
  container.appendChild(listEl);

  document.getElementById('s-search').value = savedFilters.query;
  document.getElementById('s-search').addEventListener('input', (e) => {
    savedFilters.query = e.target.value;
    paintList();
  });

  const typeOptions = [{ value: 'all', label: 'All' }].concat(EVIDENCE_TYPES);
  function paintTypeFilter() {
    renderChipGroup(typeFilterRow, typeOptions, savedFilters.type, false, (v) => {
      savedFilters.type = v || 'all';
      paintTypeFilter();
      paintList();
    });
  }
  paintTypeFilter();

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
      .filter((e) => savedFilters.type === 'all' || e.evidenceType === savedFilters.type)
      .filter((e) => savedFilters.status === 'all' || e.status === savedFilters.status)
      .filter((e) => {
        if (!q) return true;
        const haystack = [
          e.directEvidence, e.recentExample,
          e.interpretation, e.outsideModel, e.contextLimitation
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
      row.querySelector('.entry-type').textContent = labelFor(EVIDENCE_TYPES, entry.evidenceType);
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
    db = await openDatabase();
  } catch (err) {
    document.body.innerHTML = '<p class="save-error" role="alert">This device could not open local storage. The app cannot run without it.</p>';
    return;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* still usable online-only this run */ });
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
