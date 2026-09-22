// node test/unit.js
// Pulls the real implementations out of src/content.js rather than restating
// them, so changing a step size or the clamp fails here.
const assert = require('assert');
const read = f => require('fs').readFileSync(__dirname + '/../src/' + f, 'utf8');
const src = read('content.js'), shared = read('steps.js');

const consts = shared.match(/^const STEPS = .*$/m);
const bounds = src.match(/^const MIN = .*$/m);
const speedFn = src.match(/^function nextSpeed[\s\S]*?^}/m);
const stepFn = src.match(/^function nextStep[\s\S]*?^}/m);
const validFn = src.match(/^function validSpeed[\s\S]*?^}/m);
const defaultKeys = shared.match(/^const DEFAULT_KEYS = .*$/m);
const keysFn = shared.match(/^function validKeys[\s\S]*?^}/m);
assert(consts && bounds && speedFn && stepFn && validFn && defaultKeys && keysFn,
  'src/content.js or src/steps.js no longer has the shape test/unit.js extracts from');

const { nextSpeed, nextStep, validSpeed, validKeys, DEFAULT_KEYS, STEPS, MIN, MAX } = new Function(
  `${consts[0]}\n${bounds[0]}\n${defaultKeys[0]}\n${speedFn[0]}\n${stepFn[0]}\n${validFn[0]}\n${keysFn[0]}
   return { nextSpeed, nextStep, validSpeed, validKeys, DEFAULT_KEYS, STEPS, MIN, MAX };`)();

// Speed
assert.strictEqual(nextSpeed(1, 0.25), 1.25, 'one quarter step up from normal');
assert.strictEqual(nextSpeed(1, -0.25), 0.75, 'one quarter step down from normal');
assert.strictEqual(nextSpeed(MAX, 1), MAX, 'clamps at the maximum');
assert.strictEqual(nextSpeed(MIN, -1), MIN, 'clamps at the minimum');
assert.strictEqual(nextSpeed(MIN + 0.1, -1), MIN, 'clamps instead of going negative');
assert.strictEqual(nextSpeed(1.1, 0.25), 1.35, 'no floating point dust');
assert(MIN > 0, 'a zero or negative rate would throw in the browser');
assert(MAX <= 16, 'browsers refuse rates above 16');

// Every step lands on a value the two-decimal rounding can represent exactly,
// so repeated presses never drift off the grid.
for (const s of STEPS) {
  let v = 1;
  for (let i = 0; i < 12; i++) v = nextSpeed(v, s);
  assert.strictEqual(v, Math.min(MAX, Math.round((1 + 12 * s) * 100) / 100),
    `stepping by ${s} twelve times drifts`);
}

// Step size cycling
const defaultStep = Number(shared.match(/^const DEFAULT_STEP = (.*);$/m)[1]);
assert.strictEqual(defaultStep, 0.25, 'the default step is 0.25');
assert(STEPS.includes(defaultStep), 'the default step must be one of the choices');
let step = STEPS[0];
for (let i = 1; i < STEPS.length; i++) {
  step = nextStep(step);
  assert.strictEqual(step, STEPS[i], `cycling reached the wrong step at ${i}`);
}
assert.strictEqual(nextStep(STEPS[STEPS.length - 1]), STEPS[0], 'cycling wraps around');
assert.strictEqual(nextStep(999), STEPS[0], 'an unknown step recovers to the first');

// Remembered speed. Storage is not trusted: a value from an older version, a
// partly-synced profile or a corrupted key must degrade to normal speed rather
// than throw when assigned to playbackRate.
assert.strictEqual(validSpeed(2), 2, 'a normal saved speed survives');
assert.strictEqual(validSpeed(MIN), MIN, 'the minimum is allowed');
assert.strictEqual(validSpeed(MAX), MAX, 'the maximum is allowed');
assert.strictEqual(validSpeed(1), 1, 'normal speed is allowed');
assert.strictEqual(validSpeed(0), 1, 'zero would throw in the browser');
assert.strictEqual(validSpeed(-2), 1, 'a negative rate would throw in the browser');
assert.strictEqual(validSpeed(MAX + 1), 1, 'browsers refuse rates above the maximum');
assert.strictEqual(validSpeed(MIN - 0.01), 1, 'just below the minimum is refused');
assert.strictEqual(validSpeed('2'), 1, 'a string is not a rate');
assert.strictEqual(validSpeed(NaN), 1, 'NaN would throw in the browser');
assert.strictEqual(validSpeed(Infinity), 1, 'Infinity would throw in the browser');
assert.strictEqual(validSpeed(undefined), 1, 'nothing saved yet means normal speed');
assert.strictEqual(validSpeed(null), 1, 'a cleared key means normal speed');
assert.strictEqual(validSpeed({}), 1, 'an object is not a rate');

// Whatever the keys produce must itself be storable and restorable unchanged,
// or the speed would drift every time a tab is reopened.
for (const s of STEPS) {
  let v = 1;
  for (let i = 0; i < 8; i++) {
    v = nextSpeed(v, s);
    assert.strictEqual(validSpeed(v), v, `stepping by ${s} produced an unstorable speed ${v}`);
  }
}

// Rebindable keys. A bad set must fall back whole rather than half-apply: a
// duplicate binding would make one action permanently unreachable.
const actions = Object.keys(DEFAULT_KEYS);
assert.strictEqual(actions.length, 4, 'four actions can be rebound');
assert.strictEqual(new Set(Object.values(DEFAULT_KEYS)).size, actions.length,
  'the defaults themselves must not collide');
assert.deepStrictEqual(validKeys(DEFAULT_KEYS), DEFAULT_KEYS, 'the defaults survive a round trip');

const custom = { faster: 'e', slower: 'q', toggle: 'w', step: 'r' };
assert.deepStrictEqual(validKeys(custom), custom, 'a full custom set survives');
assert.deepStrictEqual(validKeys({ ...custom, faster: 'ArrowUp' }), { ...custom, faster: 'ArrowUp' },
  'a named key is a valid binding');

// One missing or unusable action falls back for that action alone...
assert.deepStrictEqual(validKeys({ ...custom, step: undefined }),
  { ...custom, step: DEFAULT_KEYS.step }, 'a missing binding falls back to its default');
assert.deepStrictEqual(validKeys({ ...custom, step: 42 }),
  { ...custom, step: DEFAULT_KEYS.step }, 'a non-string binding falls back');
assert.deepStrictEqual(validKeys({ ...custom, step: '' }),
  { ...custom, step: DEFAULT_KEYS.step }, 'an empty binding falls back');

// ...unless the result collides, in which case the whole set is untrustworthy.
assert.deepStrictEqual(validKeys({ faster: 'e', slower: 'e', toggle: 'w', step: 'r' }), DEFAULT_KEYS,
  'a duplicate binding rejects the whole set');
assert.deepStrictEqual(validKeys(null), DEFAULT_KEYS, 'nothing saved yet means the defaults');
assert.deepStrictEqual(validKeys('nope'), DEFAULT_KEYS, 'a non-object means the defaults');
assert.deepStrictEqual(validKeys({}), DEFAULT_KEYS, 'an empty object means the defaults');
// Mutating the result must not corrupt the defaults for the next caller.
validKeys(null).faster = 'zzz';
assert.strictEqual(validKeys(null).faster, DEFAULT_KEYS.faster, 'the fallback is a fresh copy');

console.log('ok');
