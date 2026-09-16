// Shared by the content script and the popup, loaded before both, so the step
// sizes and key bindings cannot drift between the two.
const STEPS = [0.05, 0.1, 0.25, 0.5, 1];
const DEFAULT_STEP = 0.25;
const STEP_KEY = 'step';

const KEYS_KEY = 'keys';
// Action -> default binding. These four are behind AltGr on German, French,
// Nordic and other layouts, which is the reason rebinding exists at all.
const DEFAULT_KEYS = { faster: ']', slower: '[', toggle: '\\', step: ';' };

// A saved binding set is only trusted if every action has a usable, distinct
// key. A duplicate would leave one action permanently unreachable, so the whole
// set falls back rather than half-applying. See test/unit.js.
function validKeys(value) {
  if (!value || typeof value !== 'object') return { ...DEFAULT_KEYS };
  const actions = Object.keys(DEFAULT_KEYS);
  const out = {};
  for (const action of actions) {
    const k = value[action];
    // Length caps a single character or a named key like 'ArrowUp', and rejects
    // whatever else a corrupted or hand-edited profile might hold.
    out[action] = typeof k === 'string' && k.length > 0 && k.length <= 20 ? k : DEFAULT_KEYS[action];
  }
  return new Set(Object.values(out)).size === actions.length ? out : { ...DEFAULT_KEYS };
}
