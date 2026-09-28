/* Staircase checks: up, down, early stop, and the 10-question cap. */
var assert = require("assert");
var stair = require("./staircase.js");

function runAnswers(flags) {
  var run = stair.createRun();
  flags.forEach(function (correct) { stair.answer(run, correct); });
  return run;
}

var up = runAnswers([true, true, true, true, true, true, true, true, true, true]);
assert.strictEqual(up.done, true);
assert.strictEqual(up.asked, 10);
assert.strictEqual(stair.resultLevel(up), 10);

var down = runAnswers([false, false, false, false, false, false, false, false, false, false]);
assert.strictEqual(down.asked, 10);
assert.strictEqual(stair.resultLevel(down), 1);

var wave = runAnswers([true, false, true, false, true, false, true, false]);
assert.strictEqual(wave.done, true);
assert.strictEqual(wave.asked, 8);
var mid = stair.resultLevel(wave);
assert.ok(mid >= 5 && mid <= 6, "converged level " + mid);

var late = runAnswers([true, true, true, true, true, true, true, false]);
assert.strictEqual(late.done, false);
assert.strictEqual(late.asked, 8);

assert.strictEqual(stair.labelFor(1), "Pebble");
assert.strictEqual(stair.labelFor(10), "Treasure");
assert.strictEqual(stair.labelFor(5), "Explorer");

console.log("Staircase checks passed.");
