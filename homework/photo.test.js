/* Target size for a homework photo. The long side fits inside max and is never enlarged. */
var assert = require("assert");
var photo = require("./photo.js");

function fit(w, h, max) {
  return photo.fitWithin(w, h, max);
}

var landscape = fit(4032, 3024, 1600);
assert.strictEqual(landscape.w, 1600);
assert.strictEqual(landscape.h, 1200);
assert.ok(Math.max(landscape.w, landscape.h) <= 1600);

var portrait = fit(3024, 4032, 1600);
assert.strictEqual(portrait.w, 1200);
assert.strictEqual(portrait.h, 1600);

var square = fit(2000, 2000, 1600);
assert.deepStrictEqual(square, { w: 1600, h: 1600 });

var small = fit(800, 600, 1600);
assert.deepStrictEqual(small, { w: 800, h: 600 });

var exact = fit(1600, 900, 1600);
assert.deepStrictEqual(exact, { w: 1600, h: 900 });

var almost = fit(1599, 100, 1600);
assert.deepStrictEqual(almost, { w: 1599, h: 100 });

var retry = fit(4032, 3024, 1280);
assert.strictEqual(retry.w, 1280);
assert.strictEqual(retry.h, 960);

var wide = fit(5000, 100, 1600);
assert.deepStrictEqual(wide, { w: 1600, h: 32 });

var thin = fit(1000, 1, 800);
assert.strictEqual(thin.w, 800);
assert.strictEqual(thin.h, 1);

assert.deepStrictEqual(fit(0, 0, 1600), { w: 1, h: 1 });

console.log("Homework photo fitWithin checks passed.");
