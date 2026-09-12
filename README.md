# Pathfinder Field Evidence Logger

Offline-first evidence capture for field research at Cosmonauts events. Built to the spec dated
in this repo. No backend, no login, no sync — everything lives on the phone in IndexedDB until
you export it.

## Deploy it (GitHub Pages)

1. Add every file in this folder to the repo root (drag-and-drop upload works fine on GitHub's
   web UI — you don't need git installed).
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)`. Save.
4. Wait a minute, then open the URL GitHub gives you (something like
   `https://jamesuxer.github.io/pathfinder-field-evidence-logger/`).

## Install it on the phone

1. Open that URL in **Chrome on the Android phone**, while online.
2. Tap the menu (⋮) → **Add to Home screen** / **Install app**.
3. Open the app **from the home-screen icon at least once while still online.** This is the step
   that lets the service worker cache everything — skip it and the first offline load will fail.

## Test it before you trust it

Run this exactly, on the real phone, before the event — not in a browser tab on a laptop:

- [ ] Install, open once online, then **restart the phone**.
- [ ] Turn on airplane mode. Confirm Wi-Fi is off too.
- [ ] Open the app from its home-screen icon.
- [ ] Create, edit, and save at least 5 entries.
- [ ] Close the app, lock the phone for 5 minutes, reopen — confirm everything is still there.
- [ ] Export CSV and JSON without reconnecting.
- [ ] Open the CSV in a spreadsheet — check punctuation and line breaks survived.
- [ ] Time yourself filling one basic entry — target is under 45 seconds.

This repo can't run that test for you. I haven't verified it on a physical Android device or a
screen reader — do that before the event, not after.

## What's built (the spec's "essential before the event" list)

- Offline install and launch (service worker + manifest)
- Create, autosave, edit, list entries (IndexedDB, no data held only in page memory)
- Rapid capture fields, with participant/context fields collapsed by default
- Expansion fields (interpretation, research area, follow-up) shown only when you reopen an
  entry — not during rapid capture, per the spec's own safer default
- CSV export (UTF-8, one row per record) and JSON backup, both generated on-device
- Delete with confirmation and a 6-second undo
- Search and filter by evidence type / status
- Paper fallback (`paper-fallback.html`) — same fields, print it and keep the originals until
  transcribed copies are checked

## What's deliberately not built

Matches the spec's non-goals exactly: no audio, no photos, no theme detection, no
auto-classification, no suggested questions, no scoring, no live dashboard, no CRM/lead
storage, no names or contact details, no multi-researcher sync.

## What was actually tested before this was handed over

The code has been checked for JavaScript syntax and the following behaviour was tested during
development in a simulated browser and IndexedDB environment:

- entry IDs increment correctly and don't collide (E-001, E-002, ...)
- typing into a field autosaves to IndexedDB, not just in-memory state
- an entry with only evidence type + text is flagged complete; one missing either is flagged incomplete
- direct evidence and interpretation are stored and exported as genuinely separate fields
- CSV export has all 18 columns, contains the entered text, and has no stray "undefined" values
- delete removes an entry from view immediately, and Undo actually restores it

Those development checks are not included as a reproducible test suite in this small static repo.
They cannot prove the service worker caches correctly, that timing targets are met, or that it's
usable one-handed in a noisy room. Only the phone can tell you that.

## What I could not verify from here

- **Real-device behaviour.** Airplane-mode reliability, cold-start timing, and the 45-second
  entry target are all design targets, not measurements. Section 14 of the spec is the actual
  test — run it on James's phone.
- **Accessibility.** Touch targets are 44px+, contrast follows a dark-on-light palette chosen for
  legibility, and focus states are visible — but this hasn't been through a screen reader or an
  automated contrast checker (e.g. Lighthouse, axe). Worth 20 minutes before the event.
- **Icons** are placeholder shapes I generated, not a real Pathfinder/Cosmonauts mark. Swap them
  if brand consistency matters here.

## Open decisions the spec itself flagged (unchanged — code can't resolve these)

1. Where does exported evidence actually go after the event?
2. How long do records stay on the phone after a successful export?
3. Does Cosmonauts require specific consent wording for these conversations?
4. Are the organisation-context categories the right mix for this event's attendees?
5. Research-area tagging is hidden during rapid capture (the spec's own "safer default") — worth
   confirming that's still the right call once you've used it a few times.
