/* Practice must not repeat a recent question, and the correct choice
   must land in every slot about equally often.
   Run: node questions/no-repeat.test.js */
var assert = require("assert");
var path = require("path");

var verbal = require("./verbal.js");
var english = require("./english.js");
var hebrew = require("./hebrew.js");
var russian = require("./russian.js");
var parsha = require("./parsha.js");
var math = require("./math.js");
var bank = require("./bank.js");
var Ask = require("./ask.js");

var banks = {
  verbal: verbal,
  english: english,
  hebrew: hebrew,
  russian: russian,
  parsha: parsha
};

assert.strictEqual(Ask._shuffle, require("./shuffle.js"));

function practiceRun(subject, level, times) {
  var limit = bank.recentLimit(subject, level);
  var pool = bank.poolSize(subject, level);
  assert.strictEqual(limit, Math.min(8, Math.max(0, pool - 1)));
  var ring = [];
  var ids = [];
  var prompts = [];
  var back = 0;
  var within = 0;
  var n;
  for (n = 0; n < times; n++) {
    var avoid = bank.avoidFromRecent(ring, limit);
    var question = bank.pick(subject, level, avoid, Math.random);
    assert.ok(question, subject + " level " + level + " returned nothing");
    var idWindow = ids.slice(-limit);
    var promptWindow = prompts.slice(-limit);
    if (ids.length && ids[ids.length - 1] === question.id) back += 1;
    if (idWindow.indexOf(question.id) !== -1 || promptWindow.indexOf(question.prompt) !== -1) within += 1;
    ids.push(question.id);
    prompts.push(question.prompt);
    ring = bank.rememberRecent(ring, question);
  }
  console.log(
    subject + " level " + level +
    " pool " + pool + " limit " + limit +
    " back-to-back " + back + " within-window " + within +
    " of " + times
  );
  assert.strictEqual(back, 0, subject + " level " + level + " back-to-back " + back);
  assert.strictEqual(within, 0, subject + " level " + level + " repeated inside the window " + within);
}

var subjects = ["math", "verbal", "english", "hebrew", "russian", "parsha"];
var levels = [1, 4, 7, 10];
subjects.forEach(function (subject) {
  levels.forEach(function (level) {
    practiceRun(subject, level, 500);
  });
});

function levelTestAvoid(asked, subject) {
  var map = {};
  var i;
  for (i = 0; i < asked.length; i++) map[asked[i]] = true;
  if (!asked.length) return map;
  if (subject === "math" && asked.length >= 2) map._last = [asked[asked.length - 2], asked[asked.length - 1]];
  else map._last = [asked[asked.length - 1]];
  return map;
}

function levelTestRun(subject, level, times) {
  var asked = [];
  var back = 0;
  var prev = "";
  var n;
  for (n = 0; n < times; n++) {
    var question = bank.pick(subject, level, levelTestAvoid(asked, subject), Math.random);
    assert.ok(question);
    if (prev && (question.id === prev || question.prompt === prev)) back += 1;
    prev = question.id;
    asked.push(question.id);
    if (subject === "math" || question.prompt) asked.push(question.prompt);
  }
  console.log("level-test " + subject + " level " + level + " back-to-back " + back + " of " + times);
  assert.strictEqual(back, 0, "level-test " + subject + " repeated back to back");
}

subjects.forEach(function (subject) {
  levelTestRun(subject, 4, 40);
});

var levelItems = verbal.filter(function (item) { return item.level === 4; });
var blockedLevel = {};
levelItems.forEach(function (item) {
  blockedLevel[item.id] = true;
  blockedLevel[item.prompt] = true;
});
blockedLevel._last = [levelItems[0].id, levelItems[0].prompt];
var widened = 0;
for (widened = 0; widened < 20; widened++) {
  var neighbor = bank.pick("verbal", 4, blockedLevel, Math.random);
  assert.notStrictEqual(neighbor.id, levelItems[0].id);
  assert.ok(neighbor.level === 3 || neighbor.level === 5, "expected a neighbor, got level " + neighbor.level);
}

var blockedAll = {};
verbal.forEach(function (item) {
  blockedAll[item.id] = true;
  blockedAll[item.prompt] = true;
});
blockedAll._last = [levelItems[0].id, levelItems[0].prompt];
var fallbackHits = 0;
var fallbackN;
for (fallbackN = 0; fallbackN < 30; fallbackN++) {
  var fallback = bank.pick("verbal", 4, blockedAll, Math.random);
  if (fallback.id === levelItems[0].id || fallback.prompt === levelItems[0].prompt) fallbackHits += 1;
}
console.log("fallback immediate-previous " + fallbackHits + " of 30");
assert.strictEqual(fallbackHits, 0);

var sample = levelItems[1];
var byId = {};
byId[sample.id] = true;
var byPrompt = {};
byPrompt[sample.prompt] = true;
var either;
for (either = 0; either < 30; either++) {
  assert.notStrictEqual(bank.pick("verbal", 4, byId, Math.random).id, sample.id);
  assert.notStrictEqual(bank.pick("verbal", 4, byPrompt, Math.random).id, sample.id);
}
var mathSeed = math.generateMath(4, Math.random, {});
var mathByPrompt = {};
mathByPrompt[mathSeed.prompt] = true;
var mathById = {};
mathById[mathSeed.id] = true;
for (either = 0; either < 20; either++) {
  assert.notStrictEqual(math.generateMath(4, Math.random, mathByPrompt).prompt, mathSeed.prompt);
  assert.notStrictEqual(math.generateMath(4, Math.random, mathById).id, mathSeed.id);
}

Object.keys(banks).forEach(function (subject) {
  banks[subject].forEach(function (item) {
    assert.strictEqual(item.choices[0], item.answer, subject + " bank was mutated");
  });
});

function spread(name, indexes, slots) {
  var bins = [];
  var i;
  for (i = 0; i < slots; i++) bins[i] = 0;
  indexes.forEach(function (idx) {
    assert.ok(idx >= 0 && idx < slots, name + " index " + idx);
    bins[idx] += 1;
  });
  var n = indexes.length;
  var parts = [];
  for (i = 0; i < slots; i++) {
    var pct = bins[i] / n;
    parts.push(i + ":" + bins[i] + " (" + (100 * pct).toFixed(2) + "%)");
    var low = 1 / slots - 0.04;
    var high = 1 / slots + 0.04;
    assert.ok(pct >= low && pct <= high, name + " position " + i + " is " + (100 * pct).toFixed(2) + "%");
  }
  assert.notStrictEqual(bins[slots - 1], n, name + " correct answer was always last");
  console.log(name + " n=" + n + " " + parts.join(" "));
}

Object.keys(banks).forEach(function (subject) {
  var items = banks[subject];
  var indexes = [];
  var n;
  for (n = 0; n < 4000; n++) {
    var item = items[n % items.length];
    var shuffled = Ask._shuffle(item.choices);
    indexes.push(shuffled.indexOf(item.answer));
  }
  spread(subject, indexes, 4);
});

var mathIndexes = [];
var mathN;
for (mathN = 0; mathN < 4000; mathN++) {
  var generated = math.generateMath((mathN % 10) + 1, Math.random, {});
  assert.strictEqual(generated.choices.length, 4);
  mathIndexes.push(generated.choices.indexOf(generated.answer));
}
spread("math.generateMath", mathIndexes, 4);

require(path.join("..", "brain-break", "schedule.js"));
require(path.join("..", "brain-break", "vocab.js"));
require(path.join("..", "brain-break", "parsha.js"));
require(path.join("..", "brain-break", "engine.js"));
var engine = global.BBEngine;

function engineIndexes(label, make, slots) {
  var indexes = [];
  var rng = engine.mulberry32(label.length * 1000 + 7);
  var n = 0;
  while (indexes.length < 4000) {
    var question = make(n, rng);
    n += 1;
    if (!question || question.choices.length !== slots) continue;
    indexes.push(question.choices.indexOf(question.answer));
    if (n > 20000) break;
  }
  assert.strictEqual(indexes.length, 4000, label + " collected " + indexes.length);
  spread(label, indexes, slots);
}

engineIndexes("brain-break math", function (n, rng) {
  return engine.generateMath((n % 12) + 1, rng);
}, 4);

engineIndexes("brain-break words", function (n, rng) {
  return engine.generateWords((n % 8) + 1, rng);
}, 4);

var parshaIds = [];
global.BB_PARSHA_QUESTIONS.forEach(function (item) {
  if (parshaIds.indexOf(item.parsha) === -1) parshaIds.push(item.parsha);
});
var reading = { ids: parshaIds, title: "All", kind: "parsha" };
engineIndexes("brain-break parsha", function (n, rng) {
  return engine.pickParsha((n % 3) + 1, rng, reading);
}, 4);

var translateDir = 0;
engineIndexes("brain-break translate", function (n, rng) {
  var pack = engine.generateTranslate((n % 4) + 1, rng, translateDir);
  translateDir = pack.nextDirIndex;
  if (pack.question.choices.length !== 4) return null;
  return pack.question;
}, 4);

var translateHeDir = 0;
engineIndexes("brain-break translate-he", function (n, rng) {
  var pack = engine.generateTranslate((n % 4) + 1, rng, translateHeDir);
  translateHeDir = pack.nextDirIndex;
  if (pack.question.choices.length !== 3) return null;
  return pack.question;
}, 3);

console.log("No-repeat checks passed.");
