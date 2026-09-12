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
assert(consts && bounds && speedFn && stepFn,
  'src/content.js or src/steps.js no longer has the shape test/unit.js extracts from');

const { nextSpeed, nextStep, STEPS, MIN, MAX } = new Function(
  `${consts[0]}\n${bounds[0]}\n${speedFn[0]}\n${stepFn[0]}
   return { nextSpeed, nextStep, STEPS, MIN, MAX };`)();

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

console.log('ok');
