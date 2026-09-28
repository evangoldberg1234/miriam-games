/* Checks for Brain Breaks: math, one right answer, parsha coverage. */
var assert = require("assert");
require("./schedule.js");
require("./vocab.js");
require("./parsha.js");
require("./engine.js");

var engine = global.BBEngine;
var schedule = global.BB_SCHEDULE;
var names = global.BB_PARSHA_NAMES;
var vocab = global.BB_VOCAB;
var bank = global.BB_PARSHA_QUESTIONS;

function sameChoice(list, answer) {
  return list.filter(function (item) { return item === answer; }).length;
}

function unique(list) {
  var seen = {};
  for (var i = 0; i < list.length; i++) {
    if (seen[list[i]]) return false;
    seen[list[i]] = true;
  }
  return true;
}

function iso(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return date.getFullYear() + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
}

var byParsha = {};
bank.forEach(function (question) {
  assert.ok(question.q && question.explain.length > 8, question.id + " needs an explanation");
  assert.ok(question.choices.length >= 3, question.id + " needs choices");
  assert.strictEqual(sameChoice(question.choices, question.answer), 1, question.id + " should have one correct choice");
  assert.ok(unique(question.choices), question.id + " has a repeated choice");
  byParsha[question.parsha] = (byParsha[question.parsha] || 0) + 1;
});

Object.keys(names).forEach(function (id) {
  assert.ok((byParsha[id] || 0) >= 3, id + " needs at least 3 questions, has " + (byParsha[id] || 0));
});

var seenIds = {};
schedule.forEach(function (row) {
  assert.ok(!seenIds[row.date], "duplicate " + row.date);
  seenIds[row.date] = true;
  var parts = row.date.split("-");
  var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  assert.strictEqual(date.getDay(), 6, row.date + " should be Saturday");
  assert.ok(row.ids && row.ids.length, row.date + " needs ids");
  row.ids.forEach(function (id) {
    assert.ok((byParsha[id] || 0) >= 3, row.date + " id " + id + " needs questions");
  });
});

var first = schedule[0].date.split("-");
var last = schedule[schedule.length - 1].date.split("-");
var cursor = new Date(Number(first[0]), Number(first[1]) - 1, Number(first[2]));
var end = new Date(Number(last[0]), Number(last[1]) - 1, Number(last[2]));
var weeks = 0;
while (cursor <= end) {
  assert.ok(seenIds[iso(cursor)], "missing Saturday " + iso(cursor));
  cursor.setDate(cursor.getDate() + 7);
  weeks += 1;
}
assert.ok(weeks >= 100, "expected about two years of Shabbats");

var shmini = engine.currentReading("2026-09-27");
assert.strictEqual(shmini.kind, "holiday");
assert.ok(shmini.ids.indexOf("shmini-atzeret") !== -1);
var bereshit = engine.currentReading("2026-10-10");
assert.deepStrictEqual(bereshit.ids, ["bereshit"]);
var noach = engine.currentReading("2026-10-11");
assert.deepStrictEqual(noach.ids, ["noach"]);

var saturday = engine.saturdayOnOrAfter("2026-10-10");
assert.strictEqual(engine.iso(saturday), "2026-10-10");

function checkGenerated(question) {
  assert.strictEqual(String(engine.evalCheck(question.check)), question.answer, question.prompt);
  assert.strictEqual(sameChoice(question.choices, question.answer), 1, question.prompt);
  assert.ok(unique(question.choices), question.prompt);
  assert.ok(Number(question.answer) >= 0, question.prompt + " went negative");
}

for (var seed = 1; seed <= 40; seed++) {
  var rng = engine.mulberry32(seed);
  for (var level = 1; level <= 12; level++) {
    var mathQ = engine.generateMath(level, rng);
    checkGenerated(mathQ);
    assert.ok(mathQ.explain.indexOf("more than ten") === -1, mathQ.explain);
  }
  for (level = 1; level <= 8; level++) {
    var wordQ = engine.generateWords(level, rng);
    checkGenerated(wordQ);
    assert.ok(wordQ.prompt.indexOf("mice") === -1 && wordQ.prompt.indexOf("flies") === -1, wordQ.prompt);
    assert.ok(wordQ.prompt.indexOf("shares") === -1, wordQ.prompt);
    assert.ok(!/\b1 [a-z]+s\b/.test(wordQ.prompt), wordQ.prompt);
    assert.ok(wordQ.prompt.indexOf("The ") !== -1, wordQ.prompt);
  }
}

var heNikud = /[\u0591-\u05C7]/;
var cyrillic = /[\u0400-\u04FF]/;
var heLetters = /[\u05D0-\u05EA]/;
var ids = {};
vocab.forEach(function (word) {
  assert.ok(!ids[word.id], "duplicate vocab " + word.id);
  ids[word.id] = true;
  assert.ok(word.en && word.ru && word.he, word.id);
  assert.ok(heLetters.test(word.he), word.id + " hebrew");
  assert.ok(heNikud.test(word.he), word.id + " needs nikud");
  assert.ok(cyrillic.test(word.ru), word.id + " russian");
});

for (seed = 1; seed <= 20; seed++) {
  rng = engine.mulberry32(seed + 500);
  for (var dir = 0; dir < engine.DIRS.length; dir++) {
    for (level = 1; level <= 4; level++) {
      var pack = engine.generateTranslate(level, rng, dir);
      var question = pack.question;
      assert.strictEqual(pack.nextDirIndex, (dir + 1) % engine.DIRS.length);
      assert.strictEqual(sameChoice(question.choices, question.answer), 1, question.word);
      assert.ok(unique(question.choices));
      assert.ok(question.choices.length === (question.hebrew ? 3 : 4));
      var pair = engine.DIRS[dir];
      if (pair[0] === "he" || pair[1] === "he") {
        assert.ok(question.choices.length === 3);
      }
      question.choices.concat([question.word, question.answer]).forEach(function (text) {
        if (heLetters.test(text)) assert.ok(heNikud.test(text), text);
        if (cyrillic.test(text)) assert.ok(cyrillic.test(text));
      });
    }
  }
}

var reading = engine.currentReading("2026-10-10");
for (seed = 1; seed <= 15; seed++) {
  rng = engine.mulberry32(seed + 900);
  var parshaQ = engine.pickParsha((seed % 3) + 1, rng, reading);
  assert.strictEqual(parshaQ.parshaId, "bereshit");
  assert.strictEqual(sameChoice(parshaQ.choices, parshaQ.answer), 1);
}

var holiday = engine.currentReading("2026-09-27");
rng = engine.mulberry32(3);
var holidayQ = engine.pickParsha(1, rng, holiday);
assert.ok(holiday.ids.indexOf(holidayQ.parshaId) !== -1, holidayQ.parshaId);

var joyce = engine.freshKid("joyce");
assert.strictEqual(joyce.math.level, 4);
assert.strictEqual(engine.freshKid("miriam").math.level, 1);
engine.noteAnswer(joyce.math, "math", true);
assert.strictEqual(joyce.math.level, 6);
engine.noteAnswer(joyce.math, "math", true);
engine.noteAnswer(joyce.math, "math", true);
assert.strictEqual(joyce.math.placed, true);
assert.strictEqual(joyce.math.level, 10);
joyce.math.streak = 2;
engine.noteAnswer(joyce.math, "math", true);
assert.strictEqual(joyce.math.level, 11);
assert.strictEqual(joyce.math.streak, 0);
engine.noteAnswer(joyce.math, "math", false);
engine.noteAnswer(joyce.math, "math", false);
assert.strictEqual(joyce.math.level, 10);

var plan = engine.subjectsForBreak(0);
assert.deepStrictEqual(plan.subjects, ["math", "words", "translate"]);
assert.strictEqual(plan.nextRot, 3);
assert.deepStrictEqual(engine.subjectsForBreak(3).subjects, ["parsha", "math", "words"]);

var sample = [
  { date: "2030-01-04", title: "Parashat Bo", category: "parashat" }
];
var mapped = engine.readingFromHebcalItems(sample, "2030-01-04");
assert.deepStrictEqual(mapped.ids, ["bo"]);

var combined = engine.readingFromHebcalItems(
  [{ date: "2030-01-11", title: "Parashat Vayakhel-Pekudei", category: "parashat" }],
  "2030-01-11"
);
assert.deepStrictEqual(combined.ids, ["vayakhel", "pekudei"]);
var doubled = engine.readingFromHebcalItems(
  [{ date: "2030-09-06", title: "Parashat Nitzavim-Vayeilech", category: "parashat" }],
  "2030-09-06"
);
assert.deepStrictEqual(doubled.ids, ["nitzavim", "vayelech"]);

function questionById(id) {
  for (var i = 0; i < bank.length; i++) if (bank[i].id === id) return bank[i];
  throw new Error("missing " + id);
}

var vayetzei3 = questionById("vayetzei-3");
assert.ok(vayetzei3.choices.indexOf("Bilhah only") === -1);
assert.ok(vayetzei3.choices.indexOf("Rivkah") !== -1);
assert.strictEqual(vayetzei3.answer, "Leah");

var chukat1 = questionById("chukat-1");
assert.strictEqual(chukat1.answer, "Miriam");
assert.ok(/Sages/.test(chukat1.q));
assert.ok(chukat1.choices.indexOf("A dry pit") === -1);

var numbers = {
  one: "אַחַת",
  two: "שְׁתַּיִם",
  three: "שָׁלוֹשׁ",
  four: "אַרְבַּע",
  five: "חָמֵשׁ",
  six: "שֵׁשׁ",
  seven: "שֶׁבַע",
  eight: "שְׁמוֹנֶה",
  nine: "תֵּשַׁע",
  ten: "עֶשֶׂר"
};
vocab.forEach(function (word) {
  if (numbers[word.id]) assert.strictEqual(word.he, numbers[word.id], word.id);
});
assert.strictEqual(vocab.filter(function (word) { return word.id === "sheep"; })[0].he, "כִּבְשָׂה");
assert.strictEqual(vocab.filter(function (word) { return word.id === "star"; })[0].ru, "Маген Давид");
assert.strictEqual(vocab.filter(function (word) { return word.id === "torah"; })[0].ru, "Тора");
assert.strictEqual(vocab.filter(function (word) { return word.id === "dreidel"; })[0].ru, "волчок (дрейдл)");

["2026-10-03", "2027-10-23"].forEach(function (date) {
  var row = schedule.filter(function (item) { return item.date === date; })[0];
  assert.ok(row.ids.indexOf("shmini-atzeret") !== -1);
  assert.ok(row.ids.indexOf("vzot-haberachah") !== -1);
  assert.ok(/Simchat Torah/.test(row.title), row.title);
  assert.ok(/V'Zot HaBerachah/.test(row.title), row.title);
});

for (seed = 1; seed <= 30; seed++) {
  rng = engine.mulberry32(seed + 4000);
  for (dir = 0; dir < engine.DIRS.length; dir++) {
    var mixed = engine.generateTranslate(1, rng, dir).question;
    var texts = mixed.choices.concat([mixed.word]);
    var hasBird = texts.some(function (text) { return text === "bird" || text === "птица" || text === "צִפּוֹר"; });
    var hasDove = texts.some(function (text) { return text === "dove" || text === "голубь" || text === "יוֹנָה"; });
    assert.ok(!(hasBird && hasDove), texts.join(" | "));
  }
}

assert.strictEqual(engine.gameNudge(1), 0);
assert.strictEqual(engine.gameNudge(2), 0);
assert.strictEqual(engine.gameNudge(3), 1);
assert.strictEqual(engine.gameNudge(6), 2);
assert.strictEqual(engine.gameNudge(7), 3);
assert.strictEqual(engine.gameNudge(20), 3);
assert.strictEqual(engine.gameNudge(0), 0);

var joyceMath = engine.freshKid("joyce");
var storedMath = joyceMath.math.level;
assert.strictEqual(engine.effectiveLevel(storedMath, "math", 1), storedMath);
assert.strictEqual(engine.effectiveLevel(storedMath, "math", 7), storedMath + 3);
assert.strictEqual(joyceMath.math.level, storedMath);
assert.strictEqual(engine.effectiveLevel(11, "math", 9), engine.MAX.math);
assert.strictEqual(engine.effectiveLevel(1, "translate", 6), 3);
var nudged = engine.generateMath(engine.effectiveLevel(4, "math", 7), engine.mulberry32(3));
assert.strictEqual(nudged.level, 7);
assert.strictEqual(engine.evalCheck(nudged.check), Number(nudged.answer));

var pageSource = require("fs").readFileSync(require("path").join(__dirname, "brain-break.js"), "utf8");
assert.ok(pageSource.indexOf("levelEnd") !== -1);
assert.strictEqual(pageSource.indexOf("bbtest"), -1);
assert.strictEqual(pageSource.indexOf("setInterval"), -1);
assert.strictEqual(pageSource.indexOf("betweenLevels"), -1);
assert.strictEqual(pageSource.indexOf(".attach"), -1);
assert.strictEqual(pageSource.indexOf("90000"), -1);

assert.strictEqual(engine.mapTestLevel(1, 12), 1);
assert.strictEqual(engine.mapTestLevel(10, 12), 12);
assert.strictEqual(engine.mapTestLevel(5, 12), 6);
assert.strictEqual(engine.mapTestLevel(10, 8), 8);
assert.strictEqual(engine.mapTestLevel(5, 4), 2);
assert.strictEqual(engine.mapTestLevel(5, 3), 2);
var plan = engine.seedPlan({ math: 10, verbal: 1, hebrew: 10, russian: 10, english: 4, parsha: 5 });
assert.strictEqual(plan.math, 12);
assert.strictEqual(plan.words, 1);
assert.strictEqual(plan.translate, engine.mapTestLevel(8, 4));
assert.strictEqual(plan.parsha, 2);
var seeded = engine.freshKid("miriam");
engine.applySeed(seeded, { math: 7 });
assert.strictEqual(seeded.math.level, 7);
assert.strictEqual(seeded.math.placed, true);
assert.strictEqual(seeded.words.level, 1);
assert.ok(pageSource.indexOf("seedFromLevelTest") !== -1);

console.log("Brain Break checks passed (" + bank.length + " questions, " + schedule.length + " Shabbats, " + vocab.length + " words).");
