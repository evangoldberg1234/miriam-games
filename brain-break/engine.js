/* Question makers, adaptive levels, and the weekly reading lookup.
   The page script draws the overlay. This file has no DOM. */
(function (root) {
  var MAX = { math: 12, words: 8, translate: 4, parsha: 3 };
  var JUMP = { math: 2, words: 2, translate: 1, parsha: 1 };
  var SUBJECTS = ["math", "words", "translate", "parsha"];
  var DIRS = [
    ["ru", "he"],
    ["en", "ru"],
    ["he", "en"],
    ["en", "he"],
    ["ru", "en"],
    ["he", "ru"]
  ];
  var LANG = { en: "English", ru: "Russian", he: "Hebrew" };

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

  function randInt(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  function shuffle(rng, list) {
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function clampLevel(level, max) {
    level = Math.round(Number(level) || 1);
    if (level < 1) level = 1;
    if (level > max) level = max;
    return level;
  }

  function gameNudge(gameLevel) {
    gameLevel = Math.round(Number(gameLevel) || 1);
    if (gameLevel < 1) gameLevel = 1;
    return Math.min(3, Math.floor((gameLevel - 1) / 2));
  }

  function effectiveLevel(storedLevel, subject, gameLevel) {
    var max = MAX[subject] || 1;
    return clampLevel((Number(storedLevel) || 1) + gameNudge(gameLevel), max);
  }

  function freshSubject(level) {
    return { level: level, streak: 0, missStreak: 0, placed: false, correctCount: 0 };
  }

  function freshKid(name) {
    var advanced = name === "joyce";
    return {
      math: freshSubject(advanced ? 4 : 1),
      words: freshSubject(advanced ? 4 : 1),
      translate: freshSubject(advanced ? 2 : 1),
      parsha: freshSubject(advanced ? 2 : 1)
    };
  }

  function noteAnswer(subjectState, subject, correct) {
    var max = MAX[subject];
    var jump = JUMP[subject];
    if (!subjectState.placed) {
      if (correct) {
        subjectState.correctCount += 1;
        subjectState.level = Math.min(max, subjectState.level + jump);
        if (subjectState.correctCount >= 3) subjectState.placed = true;
      } else {
        subjectState.placed = true;
        subjectState.level = Math.max(1, subjectState.level - 1);
        subjectState.missStreak = 1;
        subjectState.streak = 0;
      }
      return;
    }
    if (correct) {
      subjectState.streak += 1;
      subjectState.missStreak = 0;
      if (subjectState.streak >= 3) {
        subjectState.level = Math.min(max, subjectState.level + 1);
        subjectState.streak = 0;
      }
    } else {
      subjectState.streak = 0;
      subjectState.missStreak += 1;
      if (subjectState.missStreak >= 2) {
        subjectState.level = Math.max(1, subjectState.level - 1);
        subjectState.missStreak = 0;
      }
    }
  }

  function makeChoices(rng, answer, count) {
    var wanted = String(answer);
    var used = {};
    used[wanted] = true;
    var list = [wanted];
    var span = Math.max(3, Math.round(Math.abs(Number(answer)) * 0.12) + 2);
    var tries = 0;
    while (list.length < count && tries < 60) {
      tries += 1;
      var delta = randInt(rng, 1, span);
      if (rng() < 0.5) delta = -delta;
      var n = Number(answer) + delta;
      if (n < 0) n = Number(answer) + Math.abs(delta);
      if (n === Number(answer)) continue;
      var text = String(n);
      if (!used[text]) {
        used[text] = true;
        list.push(text);
      }
    }
    var step = 1;
    while (list.length < count) {
      var extra = String(Number(answer) + step);
      if (!used[extra]) {
        used[extra] = true;
        list.push(extra);
      }
      step += 1;
    }
    return shuffle(rng, list);
  }

  function evalCheck(check) {
    if (!check) return null;
    if (check.op === "add") return check.a + check.b;
    if (check.op === "sub") return check.a - check.b;
    if (check.op === "missing-add") return check.sum - check.a;
    if (check.op === "mulsub") return check.groups * check.each - check.minus;
    if (check.op === "muladd") return check.groups * check.each + check.plus;
    if (check.op === "chain") {
      var value = check.start;
      check.steps.forEach(function (step) {
        if (step.op === "+") value += step.n;
        else value -= step.n;
      });
      return value;
    }
    return null;
  }

  function mathQuestion(level, rng, prompt, check, explain) {
    var answer = evalCheck(check);
    return {
      subject: "math",
      level: level,
      prompt: prompt,
      choices: makeChoices(rng, answer, 4),
      answer: String(answer),
      explain: explain,
      check: check,
      display: "equation"
    };
  }

  function generateMath(level, rng) {
    level = clampLevel(level, MAX.math);
    var a;
    var b;
    var c;
    var check;
    var prompt;
    var explain;

    if (level === 1) {
      a = randInt(rng, 0, 4);
      b = randInt(rng, 1, 5 - a);
      check = { op: "add", a: a, b: b };
      prompt = a + " + " + b;
      explain = a + " plus " + b + " is " + (a + b) + ".";
    } else if (level === 2) {
      a = randInt(rng, 1, 5);
      b = randInt(rng, 1, a);
      check = { op: "sub", a: a, b: b };
      prompt = a + " − " + b;
      explain = a + " minus " + b + " is " + (a - b) + ".";
    } else if (level === 3) {
      a = randInt(rng, 1, 9);
      b = randInt(rng, 1, 10 - a);
      check = { op: "add", a: a, b: b };
      prompt = a + " + " + b;
      explain = a + " plus " + b + " is " + (a + b) + ".";
    } else if (level === 4) {
      a = randInt(rng, 2, 10);
      b = randInt(rng, 1, a);
      check = { op: "sub", a: a, b: b };
      prompt = a + " − " + b;
      explain = a + " minus " + b + " is " + (a - b) + ".";
    } else if (level === 5) {
      if (rng() < 0.5) {
        a = randInt(rng, 2, 9);
        b = randInt(rng, 11 - a, 9);
        if (a + b < 11) b = 11 - a;
        check = { op: "add", a: a, b: b };
        prompt = a + " + " + b;
        explain = "Make a ten. " + a + " plus " + b + " is " + (a + b) + ".";
      } else {
        a = randInt(rng, 11, 18);
        var ones = a % 10;
        b = randInt(rng, ones + 1, 9);
        check = { op: "sub", a: a, b: b };
        prompt = a + " − " + b;
        explain = a + " minus " + b + " is " + (a - b) + ".";
      }
    } else if (level === 6) {
      if (rng() < 0.5) {
        var tens = randInt(rng, 1, 8);
        ones = randInt(rng, 0, 7);
        b = randInt(rng, 1, 9 - ones);
        a = tens * 10 + ones;
        check = { op: "add", a: a, b: b };
        prompt = a + " + " + b;
        explain = "The ones do not pass ten. " + a + " plus " + b + " is " + (a + b) + ".";
      } else {
        ones = randInt(rng, 1, 9);
        b = randInt(rng, 1, ones);
        a = randInt(rng, 1, 8) * 10 + ones;
        check = { op: "sub", a: a, b: b };
        prompt = a + " − " + b;
        explain = a + " minus " + b + " is " + (a - b) + ".";
      }
    } else if (level === 7) {
      if (rng() < 0.5) {
        ones = randInt(rng, 2, 9);
        b = randInt(rng, 10 - ones, 9);
        a = randInt(rng, 1, 8) * 10 + ones;
        check = { op: "add", a: a, b: b };
        prompt = a + " + " + b;
        explain = "The ones make ten or more, so carry. " + a + " plus " + b + " is " + (a + b) + ".";
      } else {
        ones = randInt(rng, 0, 8);
        b = randInt(rng, ones + 1, 9);
        a = randInt(rng, 2, 9) * 10 + ones;
        check = { op: "sub", a: a, b: b };
        prompt = a + " − " + b;
        explain = "Regroup a ten. " + a + " minus " + b + " is " + (a - b) + ".";
      }
    } else if (level === 8) {
      if (rng() < 0.5) {
        var aT = randInt(rng, 1, 4);
        var aO = randInt(rng, 0, 4);
        var bT = randInt(rng, 1, 4);
        var bO = randInt(rng, 0, 4 - aO === 0 ? 0 : 4 - aO);
        if (aO + bO > 9) bO = 9 - aO;
        a = aT * 10 + aO;
        b = bT * 10 + bO;
        if (b < 10) b = 10 + bO;
        check = { op: "add", a: a, b: b };
        prompt = a + " + " + b;
        explain = a + " plus " + b + " is " + (a + b) + ". No regroup this time.";
      } else {
        aO = randInt(rng, 1, 9);
        bO = randInt(rng, 0, aO);
        aT = randInt(rng, 3, 8);
        bT = randInt(rng, 1, aT - 1);
        a = aT * 10 + aO;
        b = bT * 10 + bO;
        check = { op: "sub", a: a, b: b };
        prompt = a + " − " + b;
        explain = a + " minus " + b + " is " + (a - b) + ".";
      }
    } else if (level === 9) {
      if (rng() < 0.5) {
        aO = randInt(rng, 3, 9);
        bO = randInt(rng, 10 - aO, 9);
        aT = randInt(rng, 1, 6);
        bT = randInt(rng, 1, 7 - aT);
        a = aT * 10 + aO;
        b = bT * 10 + bO;
        check = { op: "add", a: a, b: b };
        prompt = a + " + " + b;
        explain = "Add the ones and carry. " + a + " plus " + b + " is " + (a + b) + ".";
      } else {
        aO = randInt(rng, 0, 6);
        bO = randInt(rng, aO + 1, 9);
        aT = randInt(rng, 3, 9);
        bT = randInt(rng, 1, aT - 1);
        a = aT * 10 + aO;
        b = bT * 10 + bO;
        check = { op: "sub", a: a, b: b };
        prompt = a + " − " + b;
        explain = "Regroup, then subtract. " + a + " minus " + b + " is " + (a - b) + ".";
      }
    } else if (level === 10) {
      if (rng() < 0.5) {
        a = randInt(rng, 120, 860);
        b = randInt(rng, 15, 180);
        if ((a % 10) + (b % 10) < 10) b += 5;
        check = { op: "add", a: a, b: b };
        prompt = a + " + " + b;
        explain = a + " plus " + b + " is " + (a + b) + ".";
      } else {
        a = randInt(rng, 240, 980);
        b = randInt(rng, 18, 160);
        if (b >= a) b = Math.floor(a / 3);
        if ((a % 10) >= (b % 10)) b += 3;
        if (b >= a) b = a - 17;
        check = { op: "sub", a: a, b: b };
        prompt = a + " − " + b;
        explain = a + " minus " + b + " is " + (a - b) + ".";
      }
    } else if (level === 11) {
      if (rng() < 0.5) {
        a = randInt(rng, 12, 80);
        b = randInt(rng, 8, 40);
        c = randInt(rng, 3, Math.min(30, a + b - 1));
        check = { op: "chain", start: a, steps: [{ op: "+", n: b }, { op: "-", n: c }] };
        prompt = a + " + " + b + " − " + c;
        explain = "First " + a + " + " + b + " = " + (a + b) + ". Then minus " + c + " is " + evalCheck(check) + ".";
      } else {
        a = randInt(rng, 8, 70);
        b = randInt(rng, 4, 40);
        check = { op: "missing-add", a: a, sum: a + b };
        prompt = a + " + ? = " + (a + b);
        explain = "What is missing? " + (a + b) + " minus " + a + " is " + b + ".";
      }
    } else {
      if (rng() < 0.5) {
        a = randInt(rng, 1100, 7600);
        b = randInt(rng, 180, 2400);
        check = { op: "add", a: a, b: b };
        prompt = a + " + " + b;
        explain = a + " plus " + b + " is " + (a + b) + ".";
      } else {
        a = randInt(rng, 40, 90);
        b = randInt(rng, 15, 40);
        c = randInt(rng, 8, 30);
        if (c >= a + b) c = 8;
        check = { op: "chain", start: a, steps: [{ op: "+", n: b }, { op: "-", n: c }] };
        prompt = a + " + " + b + " − " + c;
        explain = "Do it in two steps. " + a + " + " + b + " = " + (a + b) + ", then minus " + c + " is " + evalCheck(check) + ".";
      }
    }

    return mathQuestion(level, rng, prompt, check, explain);
  }

  var ANIMALS = [
    ["cat", "fish"],
    ["dog", "bones"],
    ["fox", "berries"],
    ["owl", "berries"],
    ["bear", "apples"],
    ["frog", "crumbs"],
    ["bird", "seeds"],
    ["bunny", "carrots"]
  ];

  function noun(n, word) {
    if (n === 1) {
      if (word === "fish") return "fish";
      if (word.slice(-3) === "ies") return word.slice(0, -3) + "y";
      if (word.slice(-1) === "s") return word.slice(0, -1);
    }
    return word;
  }

  function animal(rng) {
    return ANIMALS[randInt(rng, 0, ANIMALS.length - 1)];
  }

  function wordQuestion(level, rng, prompt, check, explain) {
    var answer = evalCheck(check);
    return {
      subject: "words",
      level: level,
      prompt: prompt,
      choices: makeChoices(rng, answer, 4),
      answer: String(answer),
      explain: explain,
      check: check,
      display: "story"
    };
  }

  function generateWords(level, rng) {
    level = clampLevel(level, MAX.words);
    var who = animal(rng);
    var name = who[0];
    var thing = who[1];
    var a;
    var b;
    var c;
    var check;
    var prompt;
    var explain;

    if (level === 1) {
      a = randInt(rng, 1, 3);
      b = randInt(rng, 1, 5 - a);
      check = { op: "add", a: a, b: b };
      prompt = "The " + name + " has " + a + " " + noun(a, thing) + ". The " + name + " finds " + b + " more. How many " + noun(a + b, thing) + " now?";
      explain = a + " plus " + b + " is " + (a + b) + ". The " + name + " has " + (a + b) + " " + noun(a + b, thing) + ".";
    } else if (level === 2) {
      a = randInt(rng, 2, 5);
      b = randInt(rng, 1, a);
      check = { op: "sub", a: a, b: b };
      prompt = "The " + name + " has " + a + " " + thing + ". The " + name + " gives " + b + " away. How many are left?";
      explain = a + " minus " + b + " is " + (a - b) + ".";
    } else if (level === 3) {
      a = randInt(rng, 2, 7);
      b = randInt(rng, 1, 10 - a);
      check = { op: "add", a: a, b: b };
      prompt = "The " + name + " sees " + a + " " + noun(a, thing) + " and then " + b + " more. How many " + noun(a + b, thing) + " in all?";
      explain = a + " plus " + b + " is " + (a + b) + ".";
    } else if (level === 4) {
      a = randInt(rng, 5, 10);
      b = randInt(rng, 1, a - 1);
      check = { op: "sub", a: a, b: b };
      prompt = "There are " + a + " " + noun(a, thing) + ". The " + name + " eats " + b + ". How many are left?";
      explain = a + " minus " + b + " is " + (a - b) + ".";
    } else if (level === 5) {
      a = randInt(rng, 6, 9);
      b = randInt(rng, 11 - a, 8);
      if (a + b < 11) b = 11 - a;
      check = { op: "add", a: a, b: b };
      prompt = "The " + name + " has " + a + " " + noun(a, thing) + ". A friend brings " + b + " more. How many now?";
      explain = a + " plus " + b + " crosses ten. The answer is " + (a + b) + ".";
    } else if (level === 6) {
      var tens = randInt(rng, 2, 6);
      var ones = randInt(rng, 0, 5);
      b = randInt(rng, 1, 4);
      if (ones + b > 9) b = 9 - ones;
      a = tens * 10 + ones;
      check = { op: "add", a: a, b: b };
      prompt = "The " + name + " collects " + a + " " + noun(a, thing) + ", then finds " + b + " more. How many is that?";
      explain = a + " plus " + b + " is " + (a + b) + ".";
    } else if (level === 7) {
      ones = randInt(rng, 0, 4);
      b = randInt(rng, ones + 2, 9);
      a = randInt(rng, 3, 8) * 10 + ones;
      check = { op: "sub", a: a, b: b };
      prompt = "The " + name + " has " + a + " " + noun(a, thing) + " and gives away " + b + ". How many are left?";
      explain = "Regroup a ten. " + a + " minus " + b + " is " + (a - b) + ".";
    } else {
      var groups = randInt(rng, 3, 6);
      var each = randInt(rng, 3, 8);
      var minus = randInt(rng, 2, groups * each - 2);
      check = { op: "mulsub", groups: groups, each: each, minus: minus };
      var total = groups * each;
      prompt =
        "There are " + groups + " baskets. Each basket has " + each + " " + noun(each, thing) + ". The " + name +
        " eats " + minus + ". How many " + noun(total - minus, thing) + " are left?";
      explain = groups + " groups of " + each + " make " + total + ". Then " + total + " minus " + minus + " is " + (total - minus) + ".";
    }

    return wordQuestion(level, rng, prompt, check, explain);
  }

  function hasHebrew(text) {
    return /[\u0590-\u05FF]/.test(text);
  }

  function generateTranslate(level, rng, dirIndex) {
    level = clampLevel(level, MAX.translate);
    var index = ((dirIndex % DIRS.length) + DIRS.length) % DIRS.length;
    var pair = DIRS[index];
    var from = pair[0];
    var to = pair[1];
    var hebrew = from === "he" || to === "he";
    var cap = hebrew && level < MAX.translate ? Math.max(1, level - 1) : level;
    var vocab = root.BB_VOCAB || [];
    var pool = vocab.filter(function (word) {
      return word.level <= cap;
    });
    if (pool.length < 3) pool = vocab.filter(function (word) { return word.level <= 1; });
    var choiceCount = hebrew ? 3 : 4;
    var avoid = { bird: "dove", dove: "bird" };
    var correct = pool[randInt(rng, 0, pool.length - 1)];
    var used = {};
    used[correct[to]] = true;
    var choices = [correct[to]];
    var guard = 0;
    while (choices.length < choiceCount && guard < 80) {
      guard += 1;
      var other = pool[randInt(rng, 0, pool.length - 1)];
      if (avoid[correct.id] === other.id) continue;
      if (!used[other[to]]) {
        used[other[to]] = true;
        choices.push(other[to]);
      }
    }
    return {
      question: {
        subject: "translate",
        level: level,
        prompt: "Which " + LANG[to] + " word matches this " + LANG[from] + " word?",
        word: correct[from],
        wordLang: from,
        choices: shuffle(rng, choices),
        answer: correct[to],
        explain: correct[from] + " means " + correct.en + ". In " + LANG[to] + " it is " + correct[to] + ".",
        speak: correct[from],
        speakLang: from === "ru" ? "ru-RU" : from === "he" ? "he-IL" : "en-US",
        display: "word",
        hebrew: hebrew || hasHebrew(correct[from]) || hasHebrew(correct[to])
      },
      nextDirIndex: (index + 1) % DIRS.length
    };
  }

  function localDate(input) {
    if (!input) return new Date();
    if (typeof input === "string") {
      var parts = input.split("-");
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  function iso(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return date.getFullYear() + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
  }

  function saturdayOnOrAfter(input) {
    var date = localDate(input);
    var day = date.getDay();
    if (day !== 6) date.setDate(date.getDate() + (6 - day));
    return date;
  }

  function scheduleRows() {
    return root.BB_SCHEDULE || [];
  }

  function currentReading(input) {
    var key = iso(saturdayOnOrAfter(input || new Date()));
    var rows = scheduleRows();
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].date === key) return rows[i];
    }
    return null;
  }

  function readingTitle(reading) {
    if (!reading) return "Torah";
    return reading.title || "Torah";
  }

  function pickParsha(level, rng, reading) {
    level = clampLevel(level, MAX.parsha);
    var bank = root.BB_PARSHA_QUESTIONS || [];
    var ids = reading && reading.ids ? reading.ids : [];
    var pool = bank.filter(function (item) {
      return ids.indexOf(item.parsha) !== -1 && item.level === level;
    });
    if (!pool.length) {
      pool = bank.filter(function (item) {
        return ids.indexOf(item.parsha) !== -1;
      });
    }
    if (!pool.length) {
      pool = bank.filter(function (item) {
        return item.parsha === "general";
      });
    }
    var picked = pool[randInt(rng, 0, pool.length - 1)];
    var names = root.BB_PARSHA_NAMES || {};
    var label = names[picked.parsha] || readingTitle(reading);
    return {
      subject: "parsha",
      level: level,
      prompt: picked.q,
      choices: shuffle(rng, picked.choices.slice()),
      answer: picked.answer,
      explain: picked.explain,
      parshaId: picked.parsha,
      weekTitle: readingTitle(reading),
      chip: label,
      display: "story",
      id: picked.id
    };
  }

  function subjectsForBreak(rotIndex) {
    var start = ((rotIndex % SUBJECTS.length) + SUBJECTS.length) % SUBJECTS.length;
    var subjects = [];
    for (var i = 0; i < 3; i++) subjects.push(SUBJECTS[(start + i) % SUBJECTS.length]);
    return { subjects: subjects, nextRot: (start + 3) % SUBJECTS.length };
  }

  function normalizeTitle(title) {
    return String(title || "")
      .replace(/[’‘]/g, "'")
      .replace(/^Parashat\s+/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  var TITLE_ALIAS = {
    "vayeilech": "vayelech",
    "vezot haberachah": "vzot-haberachah",
    "v'zot haberachah": "vzot-haberachah",
    "v'zot haberakhah": "vzot-haberachah"
  };

  function idForParshaTitle(title) {
    var names = root.BB_PARSHA_NAMES || {};
    var wanted = normalizeTitle(title);
    if (TITLE_ALIAS[wanted]) return TITLE_ALIAS[wanted];
    var ids = Object.keys(names);
    for (var i = 0; i < ids.length; i++) {
      if (normalizeTitle(names[ids[i]]) === wanted) return ids[i];
    }
    var parts = wanted.split(/\s*[-/]\s*/);
    var found = [];
    parts.forEach(function (part) {
      if (TITLE_ALIAS[part]) {
        if (found.indexOf(TITLE_ALIAS[part]) === -1) found.push(TITLE_ALIAS[part]);
        return;
      }
      for (var n = 0; n < ids.length; n++) {
        if (normalizeTitle(names[ids[n]]) === part && found.indexOf(ids[n]) === -1) found.push(ids[n]);
      }
    });
    return found;
  }

  function readingFromHebcalItems(items, saturdayIso) {
    var parshaIds = [];
    var holidayIds = [];
    var holidayTitle = "";
    (items || []).forEach(function (item) {
      if (!item || String(item.date).slice(0, 10) !== saturdayIso) return;
      var category = item.category || item.leyning || "";
      var title = item.title || "";
      if (category === "parashat" || /parashat/i.test(title)) {
        var mapped = idForParshaTitle(title);
        if (typeof mapped === "string") parshaIds.push(mapped);
        else mapped.forEach(function (id) { parshaIds.push(id); });
      } else if (category === "holiday" || item.subcat === "major") {
        holidayTitle = title.replace(/^(Erev|Shabbat)\s+/i, "");
      }
    });
    if (!parshaIds.length && !holidayTitle) return null;
    if (parshaIds.length) {
      var names = root.BB_PARSHA_NAMES || {};
      return {
        date: saturdayIso,
        kind: "parsha",
        ids: parshaIds,
        title: parshaIds.map(function (id) { return names[id] || id; }).join(" / ")
      };
    }
    return { date: saturdayIso, kind: "holiday", ids: ["general"], title: holidayTitle || "Holiday" };
  }

  root.BBEngine = {
    MAX: MAX,
    JUMP: JUMP,
    SUBJECTS: SUBJECTS,
    DIRS: DIRS,
    mulberry32: mulberry32,
    freshKid: freshKid,
    noteAnswer: noteAnswer,
    evalCheck: evalCheck,
    generateMath: generateMath,
    generateWords: generateWords,
    generateTranslate: generateTranslate,
    currentReading: currentReading,
    saturdayOnOrAfter: saturdayOnOrAfter,
    iso: iso,
    pickParsha: pickParsha,
    subjectsForBreak: subjectsForBreak,
    readingFromHebcalItems: readingFromHebcalItems,
    clampLevel: clampLevel,
    gameNudge: gameNudge,
    effectiveLevel: effectiveLevel
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.BBEngine;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
