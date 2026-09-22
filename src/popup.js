// STEPS, DEFAULT_STEP and STEP_KEY come from steps.js, loaded before this.
const group = document.querySelector('.steps');

const buttons = STEPS.map(value => {
  const b = document.createElement('button');
  b.type = 'button';
  b.role = 'radio';
  b.textContent = value;
  b.ariaChecked = 'false';
  b.title = `Move the speed by ${value} per press`;
  b.addEventListener('click', () => {
    chrome.storage.sync.set({ [STEP_KEY]: value });
    mark(value);  // don't wait for the storage round trip to highlight
  });
  group.appendChild(b);
  return b;
});

function mark(value) {
  buttons.forEach((b, i) => { b.ariaChecked = String(STEPS[i] === value); });
}

chrome.storage.sync.get({ [STEP_KEY]: DEFAULT_STEP }, saved => {
  const value = saved && STEPS.includes(saved[STEP_KEY]) ? saved[STEP_KEY] : DEFAULT_STEP;
  mark(value);
});

// The step also changes from the ; key while the popup is open.
chrome.storage.onChanged.addListener(changes => {
  const c = changes[STEP_KEY];
  if (c && STEPS.includes(c.newValue)) mark(c.newValue);
});

// --- shortcuts -----------------------------------------------------------
// Every action can be rebound, because the defaults sit behind AltGr on German,
// French and Nordic layouts and are awkward or impossible to reach there.

const ACTIONS = [
  ['faster', 'Faster by one step'],
  ['slower', 'Slower by one step'],
  ['toggle', 'Toggle 1x and your last speed'],
  ['step', 'Cycle the step size'],
];

const keyList = document.querySelector('.keys');
let keys = { ...DEFAULT_KEYS };
let capturing = null;

const keyButtons = {};
for (const [action, description] of ACTIONS) {
  const dt = document.createElement('dt');
  const b = document.createElement('button');
  b.type = 'button';
  b.addEventListener('click', () => {
    capturing = capturing === action ? null : action;  // clicking again backs out
    showKeys();
  });
  dt.appendChild(b);
  const dd = document.createElement('dd');
  dd.textContent = description;
  keyList.append(dt, dd);
  keyButtons[action] = b;
}

// Named keys arrive from the browser already readable ('ArrowUp'); a space does
// not, so it is the one that needs spelling out.
const shown = k => (k === ' ' ? 'Space' : k);

function showKeys() {
  for (const [action] of ACTIONS) {
    const b = keyButtons[action];
    const waiting = capturing === action;
    b.textContent = waiting ? '…' : shown(keys[action]);
    b.ariaPressed = String(waiting);
    b.title = waiting ? 'Press any key, or Escape to cancel' : `Click to rebind, currently ${shown(keys[action])}`;
  }
}

addEventListener('keydown', e => {
  if (!capturing) return;
  e.preventDefault();
  if (e.key === 'Escape') { capturing = null; return showKeys(); }
  // A modifier on its own is not a binding; the user is still reaching for one.
  if (/^(Shift|Control|Alt|Meta|AltGraph|OS)$/.test(e.key)) return;

  // If the key already belongs to another action, trade the two rather than
  // refusing. Every action stays reachable and there is no error to explain.
  const clash = ACTIONS.map(([a]) => a).find(a => a !== capturing && keys[a] === e.key);
  if (clash) keys[clash] = keys[capturing];
  keys[capturing] = e.key;
  capturing = null;
  chrome.storage.sync.set({ [KEYS_KEY]: keys });
  showKeys();
}, true);

chrome.storage.sync.get({ [KEYS_KEY]: DEFAULT_KEYS }, saved => {
  keys = validKeys(saved[KEYS_KEY]);
  showKeys();
});

showKeys();
