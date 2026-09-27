/* Shared Brain Break for any Joyce's Web game.
   Include this script, then call JoyceBrainBreaks.attach({ isPaused }). */
(function () {
  var STORAGE_KEY = "joyce-brain-breaks";
  var SKIP_MS = 15000;
  var waiters = [];
  var booted = false;

  function whenReady(fn) {
    if (booted) fn();
    else waiters.push(fn);
  }

  function createSession(opts) {
    var intervalMs = readInterval();
    var activeMs = 0;
    var lastTick = Date.now();
    var breakOpen = false;
    var lastBreakEndedAt = 0;
    var openPromise = null;
    var finishBreak = null;
    var timerId = 0;
    var started = false;
    var state = loadState();
    repairKids();
    var liveCache = {};
    var returnPhase = "question";
    var overlay = null;
    var questions = [];
    var qIndex = 0;
    var misses = 0;
    var recorded = false;
    var owner = null;
    var phase = "players";
    var advanceTimer = 0;

    function kid(name) {
      if (!state[name]) state[name] = window.BBEngine.freshKid(name);
      return state[name];
    }

    function save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        /* Private mode can block storage. The break still works. */
      }
    }

    function paused() {
      if (breakOpen || document.hidden) return true;
      try {
        return !!(opts && opts.isPaused && opts.isPaused());
      } catch (err) {
        return false;
      }
    }

    function tick() {
      var now = Date.now();
      var delta = now - lastTick;
      lastTick = now;
      if (delta < 0) delta = 0;
      if (delta > 2000) delta = 2000;
      if (paused()) return;
      activeMs += delta;
      if (activeMs >= intervalMs) startBreak();
    }

    function start() {
      if (started) return;
      started = true;
      timerId = window.setInterval(tick, 250);
    }

    function repairKids() {
      ["joyce", "miriam"].forEach(function (name) {
        var fresh = window.BBEngine.freshKid(name);
        var saved = state[name] || {};
        Object.keys(fresh).forEach(function (subject) {
          var got = saved[subject] || {};
          fresh[subject] = {
            level: window.BBEngine.clampLevel(got.level == null ? fresh[subject].level : got.level, window.BBEngine.MAX[subject]),
            streak: Number(got.streak) || 0,
            missStreak: Number(got.missStreak) || 0,
            placed: !!got.placed,
            correctCount: Number(got.correctCount) || 0
          };
        });
        state[name] = fresh;
      });
    }

    function readingNow() {
      var key = window.BBEngine.iso(window.BBEngine.saturdayOnOrAfter(new Date()));
      if (Object.prototype.hasOwnProperty.call(liveCache, key)) {
        return liveCache[key] && liveCache[key] !== "pending" ? liveCache[key] : null;
      }
      var row = window.BBEngine.currentReading(new Date());
      if (!row) fetchHebcal(key);
      return row;
    }

    function fetchHebcal(key) {
      if (typeof fetch !== "function" || liveCache[key] === "pending") return;
      liveCache[key] = "pending";
      var url = "https://www.hebcal.com/hebcal?v=1&cfg=json&s=on&maj=on&start=" + key + "&end=" + key;
      fetch(url)
        .then(function (response) { return response.json(); })
        .then(function (data) {
          var row = window.BBEngine.readingFromHebcalItems(data && data.items, key);
          liveCache[key] = row || null;
        })
        .catch(function () {
          liveCache[key] = null;
        });
    }

    function makeQuestion(subject, who, rng, reading) {
      if (subject === "math") return window.BBEngine.generateMath(who.math.level, rng);
      if (subject === "words") return window.BBEngine.generateWords(who.words.level, rng);
      if (subject === "translate") {
        var pack = window.BBEngine.generateTranslate(who.translate.level, rng, state.dirIndex || 0);
        state.dirIndex = pack.nextDirIndex;
        return pack.question;
      }
      return window.BBEngine.pickParsha(who.parsha.level, rng, reading);
    }

    function buildQuestions(who) {
      var plan = window.BBEngine.subjectsForBreak(state.rotIndex || 0);
      state.rotIndex = plan.nextRot;
      var rng = window.BBEngine.mulberry32((Date.now() ^ ((state.rotIndex + 1) * 9973)) >>> 0);
      var reading = readingNow();
      if (reading === "pending") reading = null;
      return plan.subjects.map(function (subject) {
        return makeQuestion(subject, who, rng, reading);
      });
    }

    function refreshLaterQuestions() {
      if (!questions.length) return;
      var who = kid(state.player);
      var rng = window.BBEngine.mulberry32((Date.now() + 13) >>> 0);
      var reading = readingNow();
      if (reading === "pending") reading = null;
      var savedDir = state.dirIndex || 0;
      for (var i = qIndex + 1; i < questions.length; i++) {
        if (questions[i].subject === "translate") state.dirIndex = savedDir;
        questions[i] = makeQuestion(questions[i].subject, who, rng, reading);
        if (questions[i].subject !== "translate") state.dirIndex = savedDir;
      }
    }

    function choosePlayer(name) {
      state.player = name;
      kid(name);
      if (!questions.length) {
        questions = buildQuestions(kid(name));
        qIndex = 0;
        save();
        showQuestion();
        return;
      }
      refreshLaterQuestions();
      save();
      if (returnPhase === "reveal" || returnPhase === "done") phase = returnPhase;
      else phase = "question";
      render();
    }

    function startBreak() {
      if (breakOpen) return openPromise;
      breakOpen = true;
      questions = [];
      qIndex = 0;
      misses = 0;
      recorded = false;
      window.clearTimeout(advanceTimer);
      openPromise = new Promise(function (resolve) {
        finishBreak = resolve;
      });
      phase = state.player ? "question" : "players";
      if (state.player) {
        questions = buildQuestions(kid(state.player));
        save();
      }
      ensureOverlay();
      render();
      return openPromise;
    }

    function endBreak() {
      window.clearTimeout(advanceTimer);
      breakOpen = false;
      lastBreakEndedAt = Date.now();
      activeMs = 0;
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
      var done = finishBreak;
      finishBreak = null;
      openPromise = null;
      if (done) done();
    }

    function betweenLevels() {
      if (breakOpen) return openPromise;
      if (lastBreakEndedAt && Date.now() - lastBreakEndedAt < SKIP_MS) {
        activeMs = 0;
        return Promise.resolve();
      }
      return startBreak();
    }

    function ensureOverlay() {
      if (overlay) return;
      overlay = document.createElement("div");
      overlay.className = "bb-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Brain Break");
      document.body.appendChild(overlay);
    }

    function showQuestion() {
      misses = 0;
      recorded = false;
      owner = state.player;
      phase = "question";
      render();
    }

    function nextStep() {
      window.clearTimeout(advanceTimer);
      if (qIndex >= questions.length - 1) {
        phase = "done";
        render();
        return;
      }
      qIndex += 1;
      showQuestion();
    }

    function grade(correct) {
      if (recorded) return;
      recorded = true;
      var who = kid(owner || state.player);
      var subject = questions[qIndex].subject;
      window.BBEngine.noteAnswer(who[subject], subject, correct);
      save();
    }

    function onChoice(button, question) {
      if (phase !== "question") return;
      if (button.disabled) return;
      if (button.getAttribute("data-choice") === question.answer) {
        grade(true);
        button.classList.add("right");
        var note = overlay.querySelector(".bb-note");
        if (note) note.textContent = "Yes!";
        var buttons = overlay.querySelectorAll(".bb-choice");
        for (var i = 0; i < buttons.length; i++) buttons[i].disabled = true;
        advanceTimer = window.setTimeout(nextStep, 700);
        return;
      }
      misses += 1;
      grade(false);
      button.disabled = true;
      button.classList.add("wrong");
      if (misses >= 2) {
        phase = "reveal";
        render();
        return;
      }
      var hint = overlay.querySelector(".bb-note");
      if (hint) hint.textContent = "Almost! Try another one.";
    }

    function speak(text, lang) {
      try {
        if (!window.speechSynthesis || !text) return;
        window.speechSynthesis.cancel();
        var utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang || "en-US";
        window.speechSynthesis.speak(utter);
      } catch (err) {
        /* No voice is fine. The word is still on the screen. */
      }
    }

    function scriptClass(text) {
      if (/[\u0590-\u05FF]/.test(text)) return "bb-he";
      if (/[\u0400-\u04FF]/.test(text)) return "bb-ru";
      return "";
    }

    function render() {
      if (!overlay) return;
      overlay.innerHTML = "";
      overlay.setAttribute("data-screen", phase);
      if (phase !== "question" && phase !== "reveal") {
        overlay.removeAttribute("data-subject");
        overlay.removeAttribute("data-answer");
      }
      var card = document.createElement("div");
      card.className = "bb-card";

      var top = document.createElement("div");
      top.className = "bb-top";
      var kicker = document.createElement("p");
      kicker.className = "bb-kicker";
      kicker.textContent = "Brain Break";
      top.appendChild(kicker);
      if (phase !== "players" || questions.length) {
        var switcher = document.createElement("button");
        switcher.type = "button";
        switcher.className = "bb-switch";
        var whoName = state.player === "miriam" ? "Miriam" : state.player === "joyce" ? "Joyce" : "Player";
        switcher.textContent = state.player ? whoName + " · switch" : "Switch player";
        switcher.addEventListener("click", function () {
          if (phase !== "players") returnPhase = phase;
          phase = "players";
          render();
        });
        top.appendChild(switcher);
      }
      card.appendChild(top);

      if (phase === "players") {
        var title = document.createElement("h2");
        title.className = "bb-title";
        title.textContent = "Who is playing?";
        var sub = document.createElement("p");
        sub.className = "bb-sub";
        sub.textContent = "Tap your name.";
        var players = document.createElement("div");
        players.className = "bb-players";
        players.appendChild(playerButton("Joyce", "joyce"));
        players.appendChild(playerButton("Miriam", "miriam"));
        card.appendChild(title);
        card.appendChild(sub);
        card.appendChild(players);
      } else if (phase === "done") {
        var emoji = document.createElement("div");
        emoji.className = "bb-done-emoji";
        emoji.textContent = "⭐ 🎉 ⭐";
        var doneTitle = document.createElement("h2");
        doneTitle.className = "bb-title";
        doneTitle.textContent = "Brain break complete!";
        var doneText = document.createElement("p");
        doneText.className = "bb-sub";
        doneText.textContent = "You worked hard. Back to the game!";
        var keep = document.createElement("button");
        keep.type = "button";
        keep.className = "bb-next";
        keep.textContent = "Keep playing";
        keep.addEventListener("click", endBreak);
        card.appendChild(emoji);
        card.appendChild(doneTitle);
        card.appendChild(doneText);
        card.appendChild(keep);
      } else {
        var question = questions[qIndex];
        overlay.setAttribute("data-subject", question.subject);
        overlay.setAttribute("data-answer", question.answer);
        var dots = document.createElement("ul");
        dots.className = "bb-progress";
        for (var d = 0; d < questions.length; d++) {
          var dot = document.createElement("li");
          if (d <= qIndex) dot.className = "on";
          dots.appendChild(dot);
        }
        card.appendChild(dots);
        var step = document.createElement("p");
        step.className = "bb-sub";
        step.textContent = labelFor(question) + " · " + (qIndex + 1) + " of " + questions.length;
        card.appendChild(step);
        if (question.subject === "parsha" && question.weekTitle) {
          var week = document.createElement("p");
          week.className = "bb-week";
          week.textContent = "This week: " + question.weekTitle;
          card.appendChild(week);
        }
        var prompt = document.createElement("p");
        prompt.className = "bb-prompt" + (question.display === "equation" ? " bb-equation" : "");
        prompt.textContent = question.prompt;
        card.appendChild(prompt);
        if (question.word) {
          var word = document.createElement("div");
          word.className = "bb-word " + scriptClass(question.word);
          word.textContent = question.word;
          if (scriptClass(question.word) === "bb-he") word.setAttribute("dir", "rtl");
          card.appendChild(word);
          if (window.speechSynthesis) {
            var hear = document.createElement("button");
            hear.type = "button";
            hear.className = "bb-speak";
            hear.textContent = "Hear it";
            hear.addEventListener("click", function () {
              speak(question.speak || question.word, question.speakLang);
            });
            card.appendChild(hear);
          }
        }
        if (phase === "reveal") {
          var answer = document.createElement("p");
          answer.className = "bb-answer " + scriptClass(question.answer);
          answer.textContent = question.answer;
          if (scriptClass(question.answer) === "bb-he") answer.setAttribute("dir", "rtl");
          var explain = document.createElement("p");
          explain.className = "bb-explain";
          explain.textContent = question.explain;
          var got = document.createElement("button");
          got.type = "button";
          got.className = "bb-next";
          got.textContent = "Got it";
          got.addEventListener("click", nextStep);
          card.appendChild(answer);
          card.appendChild(explain);
          card.appendChild(got);
        } else {
          var choices = document.createElement("div");
          choices.className = "bb-choices";
          question.choices.forEach(function (choice) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "bb-choice " + scriptClass(choice);
            button.textContent = choice;
            button.setAttribute("data-choice", choice);
            if (scriptClass(choice) === "bb-he") button.setAttribute("dir", "rtl");
            button.addEventListener("click", function () {
              onChoice(button, question);
            });
            choices.appendChild(button);
          });
          var note = document.createElement("p");
          note.className = "bb-note";
          note.textContent = "";
          card.appendChild(choices);
          card.appendChild(note);
        }
      }

      overlay.appendChild(card);
    }

    function playerButton(label, name) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "bb-player" + (name === "miriam" ? " miriam" : "");
      button.textContent = label;
      button.addEventListener("click", function () {
        choosePlayer(name);
      });
      return button;
    }

    function labelFor(question) {
      if (question.subject === "math") return "Adding and subtracting";
      if (question.subject === "words") return "Word problem";
      if (question.subject === "translate") return "Word match";
      return "Torah portion";
    }

    return {
      start: start,
      betweenLevels: betweenLevels
    };
  }

  function readInterval() {
    try {
      var raw = new URLSearchParams(window.location.search).get("bbtest");
      var seconds = Number(raw);
      if (raw && seconds > 0) return Math.max(1000, seconds * 1000);
    } catch (err) {
      /* Keep the normal minute and a half. */
    }
    return 90000;
  }

  function loadState() {
    var empty = { player: null, rotIndex: 0, dirIndex: 0 };
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return empty;
      saved.rotIndex = Number(saved.rotIndex) || 0;
      saved.dirIndex = Number(saved.dirIndex) || 0;
      if (saved.player !== "joyce" && saved.player !== "miriam") saved.player = null;
      return saved;
    } catch (err) {
      return empty;
    }
  }

  function scriptBase() {
    var script = document.currentScript;
    if (script && script.src) return script.src.replace(/[^/]*$/, "");
    var tags = document.getElementsByTagName("script");
    for (var i = tags.length - 1; i >= 0; i--) {
      if (tags[i].src && /brain-break\.js$/.test(tags[i].src)) {
        return tags[i].src.replace(/[^/]*$/, "");
      }
    }
    return "brain-break/";
  }

  function loadScripts(files, done) {
    var base = scriptBase();
    var index = 0;
    function next() {
      if (index >= files.length) {
        done();
        return;
      }
      var tag = document.createElement("script");
      tag.src = base + files[index];
      index += 1;
      tag.onload = next;
      tag.onerror = next;
      document.head.appendChild(tag);
    }
    next();
  }

  window.JoyceBrainBreaks = {
    attach: function (opts) {
      var session = null;
      whenReady(function () {
        session = createSession(opts || {});
        session.start();
      });
      return {
        betweenLevels: function () {
          return new Promise(function (resolve) {
            whenReady(function () {
              session.betweenLevels().then(resolve, resolve);
            });
          });
        }
      };
    }
  };

  loadScripts(["schedule.js", "vocab.js", "parsha.js", "engine.js"], function () {
    if (!window.BBEngine) return;
    booted = true;
    var queued = waiters.slice();
    waiters = [];
    queued.forEach(function (fn) { fn(); });
  });
})();
