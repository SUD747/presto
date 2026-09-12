// node test.js
// Pulls the real implementation out of content.js rather than restating it, so
// changing the clamp or the step in the extension fails here.
const assert = require('assert');
const src = require('fs').readFileSync(__dirname + '/content.js', 'utf8');

const consts = src.match(/^const STEP = .*$/m);
const fn = src.match(/^function nextSpeed[\s\S]*?^}/m);
assert(consts && fn, 'content.js no longer has the shape test.js extracts from');

const { nextSpeed, STEP, MIN, MAX } =
  new Function(`${consts[0]}\n${fn[0]}\nreturn { nextSpeed, STEP, MIN, MAX };`)();

assert.strictEqual(nextSpeed(1, STEP), 1.25, 'one step up from normal speed');
assert.strictEqual(nextSpeed(1, -STEP), 0.75, 'one step down from normal speed');
assert.strictEqual(nextSpeed(MAX, STEP), MAX, 'clamps at the maximum');
assert.strictEqual(nextSpeed(MIN, -STEP), MIN, 'clamps at the minimum');
assert.strictEqual(nextSpeed(MIN + 0.1, -STEP), MIN, 'clamps instead of going negative');
assert.strictEqual(nextSpeed(1.1, STEP), 1.35, 'no floating point dust');
assert(MIN > 0, 'a zero or negative rate would throw in the browser');
assert(MAX <= 16, 'browsers refuse rates above 16');

console.log('ok');
