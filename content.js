// Universal video speed controller.
// Keys: [ slower, ] faster, \ reset/restore. Or use the on-video control.
//
// Every frame runs its own copy of this script, isolated from the others, so a
// key pressed in one frame can't reach a video in another. All speed changes are
// therefore relayed to the top frame, which owns the speed and broadcasts it
// back down to every frame. Nothing applies a speed except on a broadcast.
const STEP = 0.25, MIN = 0.1, MAX = 16;
const isTop = window.top === window;

// Only non-DOM logic worth testing. See test.js.
function nextSpeed(current, delta) {
  return Math.round(Math.min(MAX, Math.max(MIN, current + delta)) * 100) / 100;
}

let desired = 1, previous = 1;

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

function apply(speed) {
  desired = speed;
  for (const el of allMedia(document)) {
    pin(el);
    if (el.playbackRate !== speed) el.playbackRate = speed;
    if (el.tagName === 'VIDEO') mount(el);
  }
  sync();
}

// --- cross-frame relay ---------------------------------------------------

function request(delta) { window.top.postMessage({ __vsc: 'key', delta }, '*'); }

function broadcast(msg, win = window.top) {
  win.postMessage(msg, '*');
  // window.frames is the window itself: indexable, but not iterable.
  for (let i = 0; i < win.frames.length; i++) broadcast(msg, win.frames[i]);
}

addEventListener('message', e => {
  const m = e.data;
  if (!m || typeof m !== 'object') return;
  if (m.__vsc === 'set') apply(m.speed);
  else if (m.__vsc === 'key' && isTop) {
    let speed;
    if (m.delta === 'toggle') {
      speed = desired === 1 ? previous : 1;
      if (desired !== 1) previous = desired;
    } else speed = nextSpeed(desired, m.delta);
    broadcast({ __vsc: 'set', speed });
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
  root.innerHTML =
    `<style>${CSS}</style><div class="bar">` +
    `<button data-d="-1">&lt;&lt;</button>` +
    `<div class="val">1x</div>` +
    `<button data-d="1">&gt;&gt;</button></div>`;
  root.addEventListener('click', e => {
    const t = e.target.closest('button,.val');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();  // don't let the click reach the player underneath
    request(t.dataset.d ? Number(t.dataset.d) * STEP : 'toggle');
  });
  overlays.set(el, host);
  host.__val = root.querySelector('.val');
  // Players resize without a window resize: theater mode, rotation, layout shift.
  host.__ro = new ResizeObserver(sync);
  host.__ro.observe(el);
  place(el, host);
}

function label(el) {
  const host = overlays.get(el);
  if (host) host.__val.textContent = `${Math.round(el.playbackRate * 100) / 100}x`;
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

  let delta;
  if (e.key === ']') delta = STEP;
  else if (e.key === '[') delta = -STEP;
  else if (e.key === '\\') delta = 'toggle';
  else return;

  e.preventDefault();
  e.stopPropagation();  // YouTube and Netflix bind keys on their own handlers.
  request(delta);
}, true);
