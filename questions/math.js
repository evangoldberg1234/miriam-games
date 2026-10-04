/* Procedural math, levels 1–10. The arithmetic is stored beside the
   prompt so a checker can recompute the answer. No DOM. */
(function (root) {
  var shuffle = root.QShuffle;
  if (!shuffle && typeof require === "function") shuffle = require("./shuffle.js");

  function randInt(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  function solve(spec) {
    if (spec.op === "add") return spec.a + spec.b;
    if (spec.op === "sub") return spec.a - spec.b;
    if (spec.op === "missing") return spec.sum - spec.a;
    if (spec.op === "chain") return spec.a + spec.b - spec.c;
    if (spec.op === "mul") return spec.a * spec.b;
    if (spec.op === "div") return spec.a / spec.b;
    if (spec.op === "muladd") return spec.a * spec.b + spec.c;
    return null;
  }

  function choicesFor(rng, answer) {
    var used = {};
    var list = [String(answer)];
    used[String(answer)] = true;
    var span = Math.max(3, Math.round(Math.abs(answer) * 0.2) + 2);
    var tries = 0;
    while (list.length < 4 && tries < 40) {
      tries += 1;
      var delta = 1 + Math.floor(rng() * span);
      if (rng() < 0.5) delta = -delta;
      var n = answer + delta;
      if (n < 0 || used[String(n)]) continue;
      used[String(n)] = true;
      list.push(String(n));
    }
    var step = 1;
    while (list.length < 4) {
      var extra = String(answer + step);
      if (!used[extra]) {
        used[extra] = true;
        list.push(extra);
      }
      step += 1;
    }
    return list;
  }

  function specFor(level, rng) {
    var a;
    var b;
    var c;
    var spec;
    var prompt;
    var explain;
    if (level === 1) {
      a = randInt(rng, 0, 4);
      b = randInt(rng, 0, 5 - a);
      spec = { op: "add", a: a, b: b };
      prompt = a + " + " + b;
      explain = a + " plus " + b + " is " + (a + b) + ".";
    } else if (level === 2) {
      a = randInt(rng, 1, 5);
      b = randInt(rng, 0, a);
      spec = { op: "sub", a: a, b: b };
      prompt = a + " − " + b;
      explain = a + " minus " + b + " is " + (a - b) + ".";
    } else if (level === 3) {
      a = randInt(rng, 1, 9);
      b = randInt(rng, 1, 10 - a);
      spec = { op: "add", a: a, b: b };
      prompt = a + " + " + b;
      explain = a + " plus " + b + " is " + (a + b) + ".";
    } else if (level === 4) {
      a = randInt(rng, 2, 10);
      b = randInt(rng, 1, a);
      spec = { op: "sub", a: a, b: b };
      prompt = a + " − " + b;
      explain = a + " minus " + b + " is " + (a - b) + ".";
    } else if (level === 5) {
      if (rng() < 0.5) {
        a = randInt(rng, 6, 12);
        b = randInt(rng, 3, 8);
        spec = { op: "add", a: a, b: b };
        prompt = a + " + " + b;
        explain = a + " plus " + b + " is " + (a + b) + ".";
      } else {
        a = randInt(rng, 11, 18);
        b = randInt(rng, 2, 9);
        spec = { op: "sub", a: a, b: b };
        prompt = a + " − " + b;
        explain = a + " minus " + b + " is " + (a - b) + ".";
      }
    } else if (level === 6) {
      a = randInt(rng, 2, 9);
      b = randInt(rng, 2, 9);
      spec = { op: "missing", a: a, sum: a + b };
      prompt = a + " + __ = " + (a + b);
      explain = (a + b) + " minus " + a + " is " + b + ".";
    } else if (level === 7) {
      a = randInt(rng, 4, 12);
      b = randInt(rng, 2, 8);
      c = randInt(rng, 1, Math.min(6, a + b - 1));
      spec = { op: "chain", a: a, b: b, c: c };
      prompt = a + " + " + b + " − " + c;
      explain = a + " plus " + b + " is " + (a + b) + ", then minus " + c + " is " + (a + b - c) + ".";
    } else if (level === 8) {
      a = [2, 5, 10][randInt(rng, 0, 2)];
      b = randInt(rng, 1, 10);
      spec = { op: "mul", a: a, b: b };
      prompt = a + " × " + b;
      explain = a + " times " + b + " is " + (a * b) + ".";
    } else if (level === 9) {
      if (rng() < 0.5) {
        a = randInt(rng, 3, 6);
        b = randInt(rng, 3, 9);
        spec = { op: "mul", a: a, b: b };
        prompt = a + " × " + b;
        explain = a + " times " + b + " is " + (a * b) + ".";
      } else {
        b = randInt(rng, 2, 9);
        c = randInt(rng, 2, 9);
        a = b * c;
        spec = { op: "div", a: a, b: b };
        prompt = a + " ÷ " + b;
        explain = b + " times " + c + " is " + a + ", so " + a + " divided by " + b + " is " + c + ".";
      }
    } else {
      a = randInt(rng, 2, 5);
      b = randInt(rng, 2, 6);
      c = randInt(rng, 1, 6);
      spec = { op: "muladd", a: a, b: b, c: c };
      prompt = a + " × " + b + " + " + c;
      explain = a + " times " + b + " is " + (a * b) + ", plus " + c + " is " + (a * b + c) + ".";
    }
    return { spec: spec, prompt: prompt, explain: explain };
  }

  function mathId(level, prompt) {
    return "math-" + level + "-" + String(prompt).replace(/\s+/g, "");
  }

  /* Avoid matches either the prompt or the id. _last is the question
     just asked, used only when every random try hits the avoid list. */
  function blocked(avoid, prompt, id) {
    if (!avoid) return false;
    if (prompt && avoid[prompt] === true) return true;
    if (id && avoid[id] === true) return true;
    return false;
  }

  function isPrevious(avoid, prompt, id) {
    var last = avoid && avoid._last;
    if (!last) return false;
    var i;
    for (i = 0; i < last.length; i++) {
      if (last[i] && (last[i] === prompt || last[i] === id)) return true;
    }
    return false;
  }

  function generateMath(level, rng, avoid) {
    level = Math.round(Number(level) || 1);
    if (level < 1) level = 1;
    if (level > 10) level = 10;
    avoid = avoid || {};
    rng = rng || Math.random;
    var built = null;
    var spare = null;
    var tries = 0;
    while (tries < 80) {
      tries += 1;
      var candidate = specFor(level, rng);
      var id = mathId(level, candidate.prompt);
      if (!blocked(avoid, candidate.prompt, id)) {
        built = candidate;
        break;
      }
      if (!isPrevious(avoid, candidate.prompt, id)) spare = candidate;
    }
    if (!built) built = spare || specFor(level, rng);
    var answer = solve(built.spec);
    return {
      id: mathId(level, built.prompt),
      subject: "math",
      level: level,
      prompt: built.prompt,
      choices: shuffle(choicesFor(rng, answer), rng),
      answer: String(answer),
      explain: built.explain,
      spec: built.spec,
      speak: built.prompt,
      speakLang: "en-US"
    };
  }

  root.QMath = { generateMath: generateMath, solve: solve };
  if (typeof module !== "undefined" && module.exports) module.exports = root.QMath;
})(typeof globalThis !== "undefined" ? globalThis : this);
