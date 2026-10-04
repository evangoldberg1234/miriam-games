/* Puts the question files together. Load math.js and the subject
   files before this one. */
(function (root) {
  var shuffle = root.QShuffle;
  if (!shuffle && typeof require === "function") shuffle = require("./shuffle.js");

  var SUBJECTS = [
    { id: "math", title: "Math", emoji: "🔢", about: "Numbers and operations." },
    { id: "verbal", title: "Verbal", emoji: "📚", about: "Reading, words, and reasoning." },
    { id: "english", title: "English", emoji: "✏️", about: "Spelling and grammar." },
    { id: "hebrew", title: "Hebrew", emoji: "א", about: "Letters, nikud, words, and sentences." },
    { id: "russian", title: "Russian", emoji: "А", about: "Letters, words, and sentences." },
    { id: "parsha", title: "Parsha", emoji: "📜", about: "Torah stories and holidays." }
  ];

  /* Distinct prompts specFor can build at each level. Every level is
     larger than 9, so the practice window stays at 8. */
  var MATH_POOL = { 1: 20, 2: 20, 3: 45, 4: 54, 5: 106, 6: 64, 7: 377, 8: 30, 9: 92, 10: 120 };

  function lists() {
    return {
      verbal: root.Q_VERBAL || [],
      english: root.Q_ENGLISH || [],
      hebrew: root.Q_HEBREW || [],
      russian: root.Q_RUSSIAN || [],
      parsha: root.Q_PARSHA || []
    };
  }

  function blockedItem(item, avoid) {
    if (!avoid || !item) return false;
    if (item.id && avoid[item.id] === true) return true;
    if (item.prompt && avoid[item.prompt] === true) return true;
    return false;
  }

  function isPrevious(item, avoid) {
    var last = avoid && avoid._last;
    if (!last || !last.length || !item) return false;
    var i;
    for (i = 0; i < last.length; i++) {
      if (last[i] && (last[i] === item.id || last[i] === item.prompt)) return true;
    }
    return false;
  }

  /* Prefer the exact level. If those are all in the avoid map, open
     the window to ±1 and then ±2 before allowing a repeat. The repeat
     fallback still skips the question just asked when another exists. */
  function closest(items, level, avoid) {
    avoid = avoid || {};
    var pool = [];
    var band;
    for (band = 0; band <= 2; band++) {
      pool = items.filter(function (item) {
        return Math.abs(item.level - level) <= band && !blockedItem(item, avoid);
      });
      if (pool.length) break;
    }
    if (!pool.length) {
      pool = items.filter(function (item) { return !isPrevious(item, avoid); });
      if (!pool.length) pool = items.slice();
    }
    var bestGap = 99;
    var i;
    for (i = 0; i < pool.length; i++) {
      var gap = Math.abs(pool[i].level - level);
      if (gap < bestGap) bestGap = gap;
    }
    return pool.filter(function (item) {
      return Math.abs(item.level - level) === bestGap;
    });
  }

  function shuffledCopy(item, rng) {
    var copy = {};
    var names = Object.keys(item);
    var i;
    for (i = 0; i < names.length; i++) copy[names[i]] = item[names[i]];
    copy.choices = shuffle(item.choices, rng);
    return copy;
  }

  function pick(subject, level, avoid, rng) {
    avoid = avoid || {};
    rng = rng || Math.random;
    level = Math.round(Number(level) || 1);
    var question = null;
    if (subject === "math") question = root.QMath.generateMath(level, rng, avoid);
    else {
      var pool = closest(lists()[subject] || [], level, avoid);
      if (pool.length) question = pool[Math.floor(rng() * pool.length)];
    }
    if (!question) return null;
    return shuffledCopy(question, rng);
  }

  function poolSize(subject, level) {
    level = Math.round(Number(level) || 1);
    if (level < 1) level = 1;
    if (level > 10) level = 10;
    if (subject === "math") return MATH_POOL[level];
    var items = lists()[subject] || [];
    var n = 0;
    var i;
    for (i = 0; i < items.length; i++) {
      if (items[i].level === level) n += 1;
    }
    return n || items.length || 1;
  }

  function recentLimit(subject, level) {
    var pool = poolSize(subject, level);
    if (pool <= 1) return 0;
    return Math.min(8, pool - 1);
  }

  /* recentKeys is a flat ring: id, prompt, id, prompt, ...
     limit is a question count. Both keys of each question are avoided. */
  function avoidFromRecent(recentKeys, limit) {
    var avoid = {};
    var keys = recentKeys || [];
    var count = Math.max(0, limit) * 2;
    var slice = count ? keys.slice(Math.max(0, keys.length - count)) : [];
    var i;
    for (i = 0; i < slice.length; i++) {
      if (slice[i]) avoid[slice[i]] = true;
    }
    if (keys.length) {
      var tail = keys.slice(-2);
      var last = [];
      for (i = 0; i < tail.length; i++) if (tail[i]) last.push(tail[i]);
      if (last.length) avoid._last = last;
    }
    return avoid;
  }

  function rememberRecent(recentKeys, question) {
    var ring = (recentKeys || []).slice();
    if (question && question.id != null && question.id !== "") ring.push(String(question.id));
    if (question && question.prompt && String(question.prompt) !== String(question.id)) {
      ring.push(String(question.prompt));
    }
    var max = 8 * 2;
    if (ring.length > max) ring = ring.slice(ring.length - max);
    return ring;
  }

  function subjects() {
    var settings = root.KIDS_SETTINGS;
    if (!settings || !settings.subjects) return SUBJECTS.slice();
    var on = settings.subjects;
    var langs = settings.languages || [];
    return SUBJECTS.filter(function (item) {
      if (on[item.id] === false) return false;
      if (langs.length && item.id === "hebrew" && langs.indexOf("he") === -1) return false;
      if (langs.length && item.id === "russian" && langs.indexOf("ru") === -1) return false;
      if (langs.length && item.id === "english" && langs.indexOf("en") === -1) return false;
      return true;
    });
  }

  root.QuestionBank = {
    get subjects() { return subjects(); },
    lists: lists,
    pick: pick,
    poolSize: poolSize,
    recentLimit: recentLimit,
    avoidFromRecent: avoidFromRecent,
    rememberRecent: rememberRecent
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.QuestionBank;
})(typeof globalThis !== "undefined" ? globalThis : this);
