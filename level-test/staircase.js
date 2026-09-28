/* Adaptive staircase for levels 1–10.
   Start at 5. A correct answer steps up one. A wrong answer steps down one.
   A reversal is a change of direction. Stop after 8 questions when the last
   two reversals are within 1 of each other, and always stop by 10. */
(function (root) {
  var LABELS = {
    1: "Pebble",
    2: "Shell",
    3: "Sprout",
    4: "Scout",
    5: "Explorer",
    6: "Ranger",
    7: "Navigator",
    8: "Captain",
    9: "Hero",
    10: "Treasure"
  };

  function defaultStart() {
    var settings = root.KIDS_SETTINGS;
    var n = settings && settings.levelTest && Number(settings.levelTest.startLevel);
    if (n >= 1 && n <= 10) return Math.round(n);
    return 5;
  }

  function createRun(start) {
    var level = Math.round(Number(start));
    if (!(level >= 1 && level <= 10)) level = defaultStart();
    return {
      level: level,
      asked: 0,
      lastDir: 0,
      reversals: [],
      history: [],
      done: false
    };
  }

  function answer(run, correct) {
    if (run.done) return run;
    var dir = correct ? 1 : -1;
    var askedLevel = run.level;
    if (run.lastDir !== 0 && dir !== run.lastDir) run.reversals.push(askedLevel);
    run.lastDir = dir;
    run.asked += 1;
    run.history.push({ level: askedLevel, correct: !!correct });
    run.level = correct ? Math.min(10, askedLevel + 1) : Math.max(1, askedLevel - 1);
    var agree = false;
    if (run.reversals.length >= 2) {
      var a = run.reversals[run.reversals.length - 1];
      var b = run.reversals[run.reversals.length - 2];
      agree = Math.abs(a - b) <= 1;
    }
    if (run.asked >= 10 || (run.asked >= 8 && agree)) run.done = true;
    return run;
  }

  function resultLevel(run) {
    if (run.reversals.length >= 2) {
      var a = run.reversals[run.reversals.length - 1];
      var b = run.reversals[run.reversals.length - 2];
      var n = Math.round((a + b) / 2);
      if (n < 1) n = 1;
      if (n > 10) n = 10;
      return n;
    }
    if (run.history.length) return run.history[run.history.length - 1].level;
    return 5;
  }

  function labelFor(level) {
    return LABELS[level] || LABELS[5];
  }

  root.Staircase = {
    LABELS: LABELS,
    createRun: createRun,
    answer: answer,
    resultLevel: resultLevel,
    labelFor: labelFor
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.Staircase;
})(typeof globalThis !== "undefined" ? globalThis : this);
