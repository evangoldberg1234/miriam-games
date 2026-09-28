/* Extra questions at the saved level. A correct answer earns one star
   when the star ledger accepts it. Practice still runs if stars are locked
   or the server is not ready. */
(function () {
  var app = document.getElementById("app");
  var data = window.LevelStore.load();
  var cfg = window.KIDS_CHAT || {};
  var botName = cfg.botName || "your guide";
  var botEmoji = cfg.botEmoji || "⭐";
  var subject = null;
  var level = 5;

  function starsOn() {
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (feats) return !!feats.stars;
    return !!(cfg.functionsUrl);
  }

  function fallbackLevel() {
    var settings = window.KIDS_SETTINGS;
    var n = settings && settings.levelTest && Number(settings.levelTest.startLevel);
    if (n >= 1 && n <= 10) return Math.round(n);
    return 5;
  }

  function practicePrice() {
    var prices = window.KIDS_SETTINGS && window.KIDS_SETTINGS.starPrices;
    if (prices && typeof prices.practice === "number") return prices.practice;
    return 1;
  }
  var current = null;
  var busy = false;
  var starNote = "";

  function savePractice() {
    data.practice[subject] = level;
    window.LevelStore.save(data);
  }

  function startLevel(id) {
    var saved = data.practice[id];
    if (saved == null && data.results[id]) saved = data.results[id].level;
    level = saved || fallbackLevel();
    subject = id;
    starNote = "";
    nextQuestion();
  }

  function nextQuestion() {
    var avoid = {};
    current = window.QuestionBank.pick(subject, level, avoid, Math.random);
    busy = false;
    renderQuestion();
  }

  function renderHome() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "pick");
    var box = document.createElement("div");
    box.className = "mascot";
    var lead = starsOn()
      ? botName + " has extra questions. A right answer can earn " + practicePrice() + " star."
      : botName + " has extra questions. Play as many as you like.";
    if (starsOn() && practicePrice() !== 1) {
      lead = botName + " has extra questions. A right answer can earn " + practicePrice() + " stars.";
    }
    box.innerHTML = "<div class='mascot-face'>" + botEmoji + "</div><p>" + lead + "</p>";
    app.appendChild(box);
    var grid = document.createElement("div");
    grid.className = "map-grid";
    window.QuestionBank.subjects.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "island";
      var at = data.practice[item.id] || (data.results[item.id] && data.results[item.id].level) || fallbackLevel();
      button.innerHTML = "<span>" + item.emoji + "</span><span>" + item.title + "</span><span class='badge'>Level " + at + "</span>";
      button.addEventListener("click", function () { startLevel(item.id); });
      grid.appendChild(button);
    });
    app.appendChild(grid);
  }

  function renderQuestion() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "question");
    app.setAttribute("data-subject", subject);
    var meta = document.createElement("p");
    meta.className = "q-kicker";
    meta.textContent = "Level " + level + (starNote ? " · " + starNote : "");
    app.appendChild(meta);
    var card = document.createElement("div");
    card.className = "q-card";
    card.id = "q-card";
    app.appendChild(card);
    window.Ask.render(card, current, onChoice);
    var quit = document.createElement("button");
    quit.type = "button";
    quit.className = "quest-side";
    quit.textContent = "Pick another subject";
    quit.addEventListener("click", function () {
      savePractice();
      renderHome();
    });
    app.appendChild(quit);
  }

  function onChoice(choice) {
    if (busy) return;
    busy = true;
    var correct = choice === current.answer;
    window.Ask.lock(document.getElementById("q-card"), choice, current, correct);
    var qid = current.id;
    var askedLevel = level;
    if (correct) level = Math.min(10, level + 1);
    else level = Math.max(1, level - 1);
    savePractice();
    var go = document.createElement("button");
    go.type = "button";
    go.className = "q-next";
    go.textContent = "Next question";
    go.addEventListener("click", nextQuestion);
    function showNext() {
      app.appendChild(go);
    }
    if (!correct || !window.KidsStars || !starsOn()) {
      starNote = correct ? "" : starNote;
      showNext();
      return;
    }
    window.KidsStars.earn({
      subject: subject,
      question_id: qid,
      answer: choice,
      level: askedLevel
    }).then(function (res) {
      if (res && res.ok) {
        starNote = "1 star earned";
        if (window.KidsStars.atCap(res)) starNote = starNote + " " + window.KidsStars.capMessage();
      } else {
        starNote = window.KidsStars.messageFor(res);
      }
      var note = document.querySelector("[data-note]");
      if (note && starNote) note.textContent = note.textContent + " " + starNote;
      showNext();
    });
  }

  renderHome();
  if (window.KidsStars && KidsStars.syncLevels) {
    KidsStars.syncLevels().then(function (res) {
      if (!res || res.source !== "server") return;
      if (app.getAttribute("data-screen") !== "pick") return;
      data = window.LevelStore.load();
      renderHome();
    }, function () { /* level sync stays quiet */ });
  }
})();
