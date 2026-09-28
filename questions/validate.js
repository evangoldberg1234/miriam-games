/* Checks the shared question banks. */
var assert = require("assert");
var math = require("./math.js");
var verbal = require("./verbal.js");
var english = require("./english.js");
var hebrew = require("./hebrew.js");
var russian = require("./russian.js");
var parsha = require("./parsha.js");

var banks = {
  verbal: verbal,
  english: english,
  hebrew: hebrew,
  russian: russian,
  parsha: parsha
};

var ids = {};
var counts = {};

function fail(message) {
  throw new Error(message);
}

Object.keys(banks).forEach(function (subject) {
  counts[subject] = {};
  banks[subject].forEach(function (item) {
    if (!item.id || ids[item.id]) fail("bad id " + item.id);
    ids[item.id] = subject;
    if (item.level < 1 || item.level > 10) fail(item.id + " level");
    if (!item.prompt || !item.explain) fail(item.id + " text");
    if (!item.choices || item.choices.length < 3) fail(item.id + " choices");
    var seen = {};
    item.choices.forEach(function (choice) {
      if (seen[choice]) fail(item.id + " duplicate choice " + choice);
      seen[choice] = true;
    });
    if (!seen[item.answer]) fail(item.id + " answer not in choices");
    counts[subject][item.level] = (counts[subject][item.level] || 0) + 1;
    var blob = JSON.stringify(item);
    if (/\u0301/.test(blob)) fail(item.id + " has a stress mark");
  });
  var level;
  for (level = 1; level <= 10; level++) {
    if ((counts[subject][level] || 0) < 6) fail(subject + " level " + level + " has " + (counts[subject][level] || 0));
  }
});

hebrew.forEach(function (item) {
  var blob = item.prompt + "\n" + item.choices.join("\n") + "\n" + item.answer;
  if (!/[\u05D0-\u05EA]/.test(blob)) fail(item.id + " missing Hebrew letters");
  if (item.level >= 2 && !/[\u0591-\u05C7]/.test(blob)) fail(item.id + " missing nikud");
});

var sawYo = false;
russian.forEach(function (item) {
  var blob = item.prompt + "\n" + item.choices.join("\n") + "\n" + item.answer;
  if (!/[\u0400-\u04FF]/.test(blob)) fail(item.id + " missing Cyrillic");
  if (/[A-Za-z]/.test(item.answer) && /[\u0400-\u04FF]/.test(item.answer)) fail(item.id + " mixed answer");
  if (/ё|Ё/.test(blob)) sawYo = true;
});
assert.ok(sawYo, "Russian bank should use ё where it belongs");

function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

var mathCount = {};
var level;
for (level = 1; level <= 10; level++) {
  mathCount[level] = 0;
  var rng = mulberry32(level * 1000);
  var avoid = {};
  var n;
  for (n = 0; n < 6; n++) {
    var question = math.generateMath(level, rng, avoid);
    avoid[question.prompt] = true;
    assert.strictEqual(String(math.solve(question.spec)), question.answer, question.prompt);
    assert.ok(question.choices.indexOf(question.answer) !== -1);
    var unique = {};
    question.choices.forEach(function (choice) {
      assert.ok(!unique[choice], question.prompt);
      unique[choice] = true;
    });
    assert.ok(question.choices.length >= 4);
    mathCount[level] += 1;
  }
  assert.ok(mathCount[level] >= 6);
}

console.log("Question banks ok.");
Object.keys(counts).forEach(function (subject) {
  var bits = [];
  var lv;
  for (lv = 1; lv <= 10; lv++) bits.push(lv + ":" + counts[subject][lv]);
  console.log(subject + " " + bits.join(" "));
});
console.log("math 6 generated per level, answers recomputed.");
