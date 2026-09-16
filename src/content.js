// Presto: playback speed control for any video or audio, on any site.
// Keys: [ slower, ] faster, \ reset/restore, ; change the step size.
// Or use the on-video control.
//
// Every frame runs its own copy of this script, isolated from the others, so a
// key pressed in one frame can't reach a video in another. All speed changes are
// therefore relayed to the top frame, which owns the speed and broadcasts it
// back down to every frame. No frame applies a speed of its own accord, with one
// exception: at load each frame restores the last saved speed from storage
// itself, because an iframe that starts late would otherwise miss the broadcast.
// STEPS, DEFAULT_STEP and STEP_KEY come from steps.js, loaded before this.
const MIN = 0.25, MAX = 16;
const SPEED_KEY = 'speed';
const isTop = window.top === window;

// The only non-DOM logic, and the only part worth unit testing. See test/unit.js.
function nextSpeed(current, delta) {
  return Math.round(Math.min(MAX, Math.max(MIN, current + delta)) * 100) / 100;
}

// Storage can hand back anything: a value written by an older version, a
// half-synced profile, or nothing at all. Only a number the browser would
// actually accept as a rate is trusted; everything else means normal speed.
function validSpeed(value) {
  return typeof value === 'number' && value >= MIN && value <= MAX ? value : 1;
}

// Cycles through the step sizes, and recovers to the first one if `current`
// somehow isn't in the list.
function nextStep(current) {
  return STEPS[(STEPS.indexOf(current) + 1) % STEPS.length];
}

// The top frame owns all three. Child frames keep copies only to render them.
let desired = 1, previous = 1, step = DEFAULT_STEP;

// The step is a saved setting, edited from the popup or cycled with a key. Any
// frame may fail to reach extension storage, in which case the default stands
// and the keys still work.
function saveStep(value) {
  try { chrome.storage.sync.set({ [STEP_KEY]: value }); } catch (e) { /* default stands */ }
}

// Remembering the speed is what makes the next video start where the last one
// left off. Debounced: holding ] fires a change per press, and storage.sync
// rejects writes past a per-minute quota. Losing the timer mid-burst is fine,
// the speed is still applied, only the record of it is late.
let speedTimer;
function saveSpeed(value) {
  clearTimeout(speedTimer);
  speedTimer = setTimeout(() => {
    try { chrome.storage.sync.set({ [SPEED_KEY]: value }); } catch (e) { /* speed still applies */ }
  }, 500);
}

try {
  chrome.storage.sync.get({ [STEP_KEY]: DEFAULT_STEP, [SPEED_KEY]: 1 }, saved => {
    if (chrome.runtime.lastError) return;
    if (STEPS.includes(saved[STEP_KEY])) step = saved[STEP_KEY];
    // Every frame restores the speed for itself rather than waiting on a
    // broadcast from the top frame, so an iframe that loads late cannot miss it.
    const speed = validSpeed(saved[SPEED_KEY]);
    if (speed !== 1) apply(speed); else sync();
  });
  chrome.storage.onChanged.addListener(changes => {
    const c = changes[STEP_KEY];
    if (c && STEPS.includes(c.newValue)) { step = c.newValue; flashStep(); }
  });
} catch (e) { /* default stands */ }

// ponytail: walks every element looking for shadow roots. Runs on media events
// and speed changes, not on a timer. Cache a registry if it ever bites.
function allMedia(root, out = []) {
  for (const el of root.querySelectorAll('video,audio,*')) {
    if (el.tagName === 'VIDEO' || el.tagName === 'AUDIO') out.push(el);
    if (el.shadowRoot) allMedia(el.shadowRoot, out);
  }
  return out;
}

function pin(el) {
  if (el.__vscPinned) return;
  el.__vscPinned = true;
  // Players reset playbackRate on quality/ad/source changes. Re-assert, guarded
  // against the loop our own assignment would cause.
  el.addEventListener('ratechange', () => {
    if (el.playbackRate !== desired) el.playbackRate = desired;
    label(el);
  });
}

function apply(speed, atStep) {
  desired = speed;
  step = atStep ?? step;  // any page can post to us; don't let it clear the step
  for (const el of allMedia(document)) {
    pin(el);
    if (el.playbackRate !== speed) el.playbackRate = speed;
    if (el.tagName === 'VIDEO') mount(el);
  }
  sync();
}

// --- cross-frame relay ---------------------------------------------------

// Child frames send a direction, never a size: the step belongs to the top frame.
function request(dir) { window.top.postMessage({ __vsc: 'key', dir }, '*'); }

function broadcast(msg, win = window.top) {
  win.postMessage(msg, '*');
  // window.frames is the window itself: indexable, but not iterable.
  for (let i = 0; i < win.frames.length; i++) broadcast(msg, win.frames[i]);
}

addEventListener('message', e => {
  const m = e.data;
  if (!m || typeof m !== 'object') return;
  if (m.__vsc === 'set') {
    apply(m.speed, m.step);
    if (m.flash) flashStep();
  } else if (m.__vsc === 'key' && isTop) {
    let speed = desired;
    if (m.dir === 'step') saveStep(step = nextStep(step));
    else if (m.dir === 'toggle') {
      speed = desired === 1 ? previous : 1;
      if (desired !== 1) previous = desired;
    } else speed = nextSpeed(desired, m.dir * step);
    // Claim the new values now. The broadcast round trip is asynchronous, so
    // waiting for them back would make rapid key presses collapse into one.
    desired = speed;
    // Only the top frame reaches here, so the speed is recorded once. Other
    // open tabs deliberately do not follow along; they pick it up next load.
    if (m.dir !== 'step') saveSpeed(speed);
    broadcast({ __vsc: 'set', speed, step, flash: m.dir === 'step' });
  }
});

// --- on-video control ----------------------------------------------------

const CSS = `
.bar{display:flex;align-items:center;gap:2px;background:rgba(28,28,30,.72);
  border-radius:8px;padding:3px;opacity:.55;transition:opacity .15s;
  font:600 12px/1 system-ui,-apple-system,sans-serif;backdrop-filter:blur(6px)}
.bar:hover{opacity:1}
button,.val{all:unset;box-sizing:border-box;height:22px;min-width:26px;
  display:flex;align-items:center;justify-content:center;color:#fff;
  border-radius:5px;cursor:pointer;font:inherit;padding:0 6px}
button:hover,.val:hover{background:rgba(255,255,255,.22)}
.val{background:rgba(255,255,255,.14);min-width:38px;font-variant-numeric:tabular-nums}`;

const overlays = new Map();  // video element -> shadow host

function mount(el) {
  if (overlays.has(el)) return;
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;z-index:2147483647;display:none';
  const root = host.attachShadow({ mode: 'closed' });
  // Built node by node rather than with innerHTML: Mozilla's add-on linter
  // rejects innerHTML assignment outright, even for a constant string.
  const style = document.createElement('style');
  style.textContent = CSS;

  const bar = document.createElement('div');
  bar.className = 'bar';

  const slower = document.createElement('button');
  slower.textContent = '<<';
  slower.dataset.d = '-1';
  slower.title = 'Slower  [';

  const val = document.createElement('div');
  val.className = 'val';
  val.textContent = '1x';

  const faster = document.createElement('button');
  faster.textContent = '>>';
  faster.dataset.d = '1';
  faster.title = 'Faster  ]';

  bar.append(slower, val, faster);
  root.append(style, bar);
  root.addEventListener('click', e => {
    const t = e.target.closest('button,.val');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();  // don't let the click reach the player underneath
    request(t.dataset.d ? Number(t.dataset.d) : 'toggle');
  });
  overlays.set(el, host);
  host.__val = val;
  // Players resize without a window resize: theater mode, rotation, layout shift.
  host.__ro = new ResizeObserver(sync);
  host.__ro.observe(el);
  place(el, host);
}

// Changing the step has nothing to show in the speed, so the readout borrows
// itself for a moment to report the new step size instead.
let flashUntil = 0, flashTimer;
function flashStep() {
  flashUntil = Date.now() + 1200;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(sync, 1250);
  sync();
}

function label(el) {
  const host = overlays.get(el);
  if (!host) return;
  host.__val.textContent = Date.now() < flashUntil
    ? `±${step}`
    : `${Math.round(el.playbackRate * 100) / 100}x`;
  host.__val.title = `Step ${step}, press ; to change it. Click to reset to 1x.`;
}

function place(el, host) {
  // Single-page apps churn players; drop the observer with the overlay.
  if (!el.isConnected) { host.__ro.disconnect(); host.remove(); overlays.delete(el); return; }
  const r = el.getBoundingClientRect();
  // Skip thumbnails, hidden players, and anything scrolled out of view.
  const show = r.width >= 160 && r.height >= 90 &&
    r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  host.style.display = show ? '' : 'none';
  if (!show) return;
  // A fixed element outside the fullscreened subtree is not painted, so the
  // host has to live inside whatever is fullscreen.
  const parent = document.fullscreenElement || document.body || document.documentElement;
  if (host.parentNode !== parent) parent.appendChild(host);
  host.style.top = `${r.top + 10}px`;
  host.style.left = `${r.right - 10}px`;
  host.style.transform = 'translateX(-100%)';
  label(el);
}

let queued = false;
function sync() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    for (const [el, host] of overlays) place(el, host);
  });
}

function scan() {
  for (const el of allMedia(document)) {
    pin(el);
    // Media already in the DOM may never fire another loadedmetadata, so this
    // is the path that gets a restored speed onto it.
    if (desired !== 1 && el.playbackRate !== desired) el.playbackRate = desired;
    if (el.tagName === 'VIDEO') mount(el);
  }
  sync();
}

addEventListener('scroll', sync, { capture: true, passive: true });
addEventListener('resize', sync, { passive: true });
document.addEventListener('fullscreenchange', () => {
  for (const host of overlays.values()) host.remove();  // re-parented on next place()
  sync();
});

// Media can appear long after load: SPA navigation, lazy players, ads.
// These events don't bubble but they do capture.
for (const ev of ['loadedmetadata', 'play', 'emptied']) {
  document.addEventListener(ev, e => {
    if (e.target.tagName !== 'VIDEO' && e.target.tagName !== 'AUDIO') return;
    pin(e.target);
    if (desired !== 1 && e.target.playbackRate !== desired) e.target.playbackRate = desired;
    scan();
  }, true);
}
document.addEventListener('DOMContentLoaded', scan);
if (document.readyState !== 'loading') scan();

// --- keys ----------------------------------------------------------------

addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

  let dir;
  if (e.key === ']') dir = 1;
  else if (e.key === '[') dir = -1;
  else if (e.key === '\\') dir = 'toggle';
  else if (e.key === ';') dir = 'step';
  else return;

  e.preventDefault();
  e.stopPropagation();  // YouTube and Netflix bind keys on their own handlers.
  request(dir);
}, true);
