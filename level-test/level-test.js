/* Treasure-map level quest. Reads the kid from window.KIDS_CHAT.
   Saves progress locally and seeds Brain Break levels when a subject ends. */
(function () {
  var app = document.getElementById("app");
  var data = window.LevelStore.load();
  var cfg = window.KIDS_CHAT || {};
  var kidName = cfg.kidName || "Friend";
  var botName = cfg.botName || "your guide";
  var botEmoji = cfg.botEmoji || "⭐";
  var busy = false;

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function hostLine(text) {
    var box = document.createElement("div");
    box.className = "mascot";
    var face = document.createElement("div");
    face.className = "mascot-face";
    face.textContent = botEmoji;
    var say = document.createElement("p");
    say.textContent = text;
    box.appendChild(face);
    box.appendChild(say);
    return box;
  }

  function button(label, className, onClick) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = className;
    el.textContent = label;
    el.addEventListener("click", onClick);
    return el;
  }

  function seedNow() {
    var levels = {};
    Object.keys(data.results).forEach(function (name) {
      levels[name] = data.results[name].level;
    });
    if (!window.JoyceBrainBreaks || !JoyceBrainBreaks.seedFromLevelTest) {
      return Promise.resolve({ plan: {}, skipped: true });
    }
    return JoyceBrainBreaks.seedFromLevelTest({ kid: cfg.kid, levels: levels });
  }

  function showMap() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "map");
    app.appendChild(hostLine(botName + " has a treasure map for " + kidName + ". Pick an island, or walk the whole map."));
    if (data.progress && data.progress.subject) {
      app.appendChild(button("Continue " + titleOf(data.progress.subject), "q-next", resume));
    }
    var grid = document.createElement("div");
    grid.className = "map-grid";
    window.QuestionBank.subjects.forEach(function (subject) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "island";
      var done = data.results[subject.id];
      card.innerHTML = "<span>" + subject.emoji + "</span><span>" + subject.title + "</span>";
      if (done) {
        var badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = done.label;
        card.appendChild(badge);
      }
      card.addEventListener("click", function () { startSubject(subject.id, false); });
      grid.appendChild(card);
    });
    app.appendChild(grid);
    app.appendChild(button("Walk the whole map", "q-next", startAll));
    if (Object.keys(data.results).length) {
      app.appendChild(button("See my levels", "quest-side", function () {
        seedNow().then(showResults);
      }));
    }
  }

  function titleOf(id) {
    var found = "Subject";
    window.QuestionBank.subjects.forEach(function (subject) {
      if (subject.id === id) found = subject.title;
    });
    return found;
  }

  function startAll() {
    var ids = window.QuestionBank.subjects.map(function (subject) { return subject.id; });
    begin(ids[0], ids.slice(1));
  }

  function startSubject(id) {
    begin(id, []);
  }

  function resume() {
    if (!data.progress) return showMap();
    if (data.progress.current) showCurrent();
    else nextQuestion();
  }

  function begin(id, queue) {
    data.progress = {
      subject: id,
      queue: queue,
      run: window.Staircase.createRun(),
      asked: [],
      current: null
    };
    window.LevelStore.save(data);
    nextQuestion();
  }

  function avoidMap() {
    var map = {};
    (data.progress.asked || []).forEach(function (id) { map[id] = true; });
    return map;
  }

  function nextQuestion() {
    var progress = data.progress;
    var question = window.QuestionBank.pick(progress.subject, progress.run.level, avoidMap(), Math.random);
    progress.current = question;
    window.LevelStore.save(data);
    showCurrent();
  }

  function showCurrent() {
    var progress = data.progress;
    var question = progress.current;
    app.innerHTML = "";
    app.setAttribute("data-screen", "question");
    app.setAttribute("data-subject", progress.subject);
    var trail = document.createElement("ul");
    trail.className = "trail";
    var n;
    for (n = 0; n < 10; n++) {
      var dot = document.createElement("li");
      if (n < progress.run.asked) dot.className = "on";
      trail.appendChild(dot);
    }
    app.appendChild(trail);
    app.appendChild(hostLine(titleOf(progress.subject) + " · question " + (progress.run.asked + 1)));
    var card = document.createElement("div");
    card.className = "q-card";
    card.id = "q-card";
    app.appendChild(card);
    window.Ask.render(card, question, onChoice);
    app.appendChild(button("Save and quit", "quest-side", function () {
      window.LevelStore.save(data);
      showMap();
    }));
  }

  function onChoice(choice) {
    if (busy || !data.progress || !data.progress.current) return;
    busy = true;
    var question = data.progress.current;
    var correct = choice === question.answer;
    window.Ask.lock(document.getElementById("q-card"), choice, question, correct);
    window.Staircase.answer(data.progress.run, correct);
    data.progress.asked.push(question.id);
    if (question.subject === "math") data.progress.asked.push(question.prompt);
    data.progress.current = null;
    window.LevelStore.save(data);
    var next = document.createElement("button");
    next.type = "button";
    next.className = "q-next";
    next.textContent = data.progress.run.done ? "See this level" : "On we go";
    next.addEventListener("click", function () {
      busy = false;
      if (data.progress.run.done) finishSubject();
      else nextQuestion();
    });
    app.appendChild(next);
  }

  function finishSubject() {
    var progress = data.progress;
    var level = window.Staircase.resultLevel(progress.run);
    data.results[progress.subject] = {
      level: level,
      label: window.Staircase.labelFor(level),
      questions: progress.run.asked,
      at: today()
    };
    var queue = progress.queue || [];
    window.LevelStore.save(data);
    if (window.KidsStars && KidsStars.setLevels) {
      /* Difficulty for later practice. Not a star award. */
      var synced = {};
      Object.keys(data.results).forEach(function (name) {
        synced[name] = data.results[name].level;
      });
      KidsStars.setLevels(synced);
    }
    seedNow().then(function (seeded) {
      if (queue.length) {
        begin(queue[0], queue.slice(1));
        return;
      }
      data.progress = null;
      window.LevelStore.save(data);
      showResults(seeded);
    });
  }

  function showResults(seeded) {
    app.innerHTML = "";
    app.setAttribute("data-screen", "results");
    app.appendChild(hostLine("The map is marked, " + kidName + "! Here are your levels."));
    var list = document.createElement("div");
    list.className = "result-list";
    window.QuestionBank.subjects.forEach(function (subject) {
      var row = document.createElement("div");
      row.className = "result-row";
      var got = data.results[subject.id];
      row.innerHTML = "<span>" + subject.emoji + " " + subject.title + "</span><span>" +
        (got ? got.label + " · level " + got.level : "Not yet") + "</span>";
      if (got) row.setAttribute("data-level", String(got.level));
      row.setAttribute("data-subject", subject.id);
      list.appendChild(row);
    });
    app.appendChild(list);
    var note = document.createElement("p");
    note.className = "seed-note";
    note.setAttribute("data-seed", "1");
    if (seeded && seeded.plan && Object.keys(seeded.plan).length) {
      var bits = Object.keys(seeded.plan).map(function (name) {
        return name + " " + seeded.plan[name];
      });
      note.textContent = "Saved for Brain Breaks on " + today() + ": " + bits.join(", ") + ".";
    } else if (seeded && seeded.skipped) {
      note.textContent = "These levels are saved on this iPad. Brain Breaks use them here.";
    } else {
      note.textContent = "Finish a subject and these levels are saved for Brain Breaks.";
    }
    app.appendChild(note);
    var again = document.createElement("div");
    again.className = "map-grid";
    window.QuestionBank.subjects.forEach(function (subject) {
      if (!data.results[subject.id]) return;
      again.appendChild(button("Retake " + subject.title, "quest-side", function () {
        delete data.results[subject.id];
        window.LevelStore.save(data);
        startSubject(subject.id);
      }));
    });
    app.appendChild(again);
    app.appendChild(button("Back to the map", "q-next", showMap));
  }

  showMap();
  if (window.KidsStars && KidsStars.syncLevels) {
    KidsStars.syncLevels().then(function (res) {
      if (!res || res.source !== "server") return;
      if (app.getAttribute("data-screen") !== "map") return;
      data = window.LevelStore.load();
      showMap();
    }, function () { /* level sync stays quiet */ });
  }
})();
