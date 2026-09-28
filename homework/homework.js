/* Homework photo check. Upload a worksheet, then poll until a person-like
   helper finishes. Hints are read aloud. Stars fly into the counter. */
(function () {
  var RETAKE = "I couldn't read that clearly. Try again with good light, the whole page in the picture, and hold still.";
  var DUPLICATE = "I already checked this one! Fix a problem, then take a new photo.";
  var NOT_HOMEWORK = "Hmm, that doesn't look like a worksheet.";
  var NEWLY = "Only newly-fixed problems earn stars.";
  var dailyCap = 20;
  if (window.KIDS_SETTINGS && window.KIDS_SETTINGS.homework && typeof window.KIDS_SETTINGS.homework.perDay === "number") {
    dailyCap = window.KIDS_SETTINGS.homework.perDay;
  }
  var DAILY = "You've earned all " + dailyCap + " homework stars today! Your answers are still checked.";
  var CHAT_LINE = "You can also chat with me about it 💬";
  var LONG_WAIT = "Still checking — I'll tell you in the chat bubble too!";
  var LINES = [
    "Looking at problem 1…",
    "Sharpening my pencil…",
    "Looking at problem 2…",
    "Reading your numbers…",
    "Checking each line…",
    "Taking a careful look…"
  ];
  var POLL_MS = 5000;
  var LONG_MS = 5 * 60 * 1000;
  var SLOW_LONG_MS = 2500;

  var app = document.getElementById("app");
  var input = document.createElement("input");
  var sheetId = "";
  var resubmit = false;
  var busy = false;
  var audioCtx = null;
  var pollTimer = null;
  var waitTimer = null;
  var lineTimer = null;
  var lineStep = 0;
  var pollId = "";
  var pollSince = 0;

  input.type = "file";
  input.accept = "image/*";
  input.setAttribute("capture", "environment");
  input.className = "hw-file";
  input.addEventListener("change", onFile);

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function kidId() {
    var cfg = window.KIDS_CHAT || {};
    return cfg.kid || "kid";
  }

  function pendingKey() {
    return "kidsHomework." + kidId() + ".pending";
  }

  function remember(id, since) {
    try {
      localStorage.setItem(pendingKey(), JSON.stringify({ sheetId: id, since: since }));
    } catch (err) { /* the check can still finish while this page is open */ }
  }

  function readPending() {
    try {
      var data = JSON.parse(localStorage.getItem(pendingKey()) || "null");
      if (!data || !data.sheetId) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function clearPending() {
    try { localStorage.removeItem(pendingKey()); } catch (err) { /* ignore */ }
  }

  function unlockAudio() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  document.addEventListener("pointerdown", unlockAudio);

  function speak(text) {
    try {
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance || !text) return;
      var voices = window.speechSynthesis.getVoices() || [];
      var voice = null;
      var i;
      for (i = 0; i < voices.length; i += 1) {
        if ((voices[i].lang || "").toLowerCase().indexOf("en") === 0) {
          voice = voices[i];
          break;
        }
      }
      if (!voice && voices.length) voice = voices[0];
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = voice ? voice.lang : "en-US";
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      /* The words stay on the screen. */
    }
  }

  function hearButton(text, label) {
    if (!window.speechSynthesis) return null;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hw-hear";
    btn.textContent = label || "Hear it";
    btn.addEventListener("click", function () { speak(text); });
    return btn;
  }

  function shootLabel(text, keep) {
    var label = el("label", "hw-shoot", text);
    label.addEventListener("click", function () { resubmit = !!keep; });
    label.appendChild(input);
    return label;
  }

  function messageFor(res) {
    if (res && res.message) return String(res.message);
    if (window.KidsStars && KidsStars.messageFor) {
      var text = KidsStars.messageFor(res);
      if (text) return text;
    }
    if (res && res.error === "slow_down") return "Wait a moment, then try the photo again.";
    if (res && res.error === "daily_cap") return DAILY;
    return "Stars are waking up...";
  }

  function sheetCapLine(cap) {
    return "That's the most stars for one sheet (" + cap + ") — amazing work!";
  }

  function resultLines(res) {
    var lines = [];
    function add(text) {
      if (!text || lines.indexOf(text) !== -1) return;
      lines.push(text);
    }
    if (res.message) add(String(res.message));
    if (typeof res.daily_remaining === "number" && res.daily_remaining === 0) add(DAILY);
    else if (!res.message && res.error === "daily_cap") add(DAILY);
    if (typeof res.sheet_cap === "number" && typeof res.sheet_stars_total === "number" && res.sheet_stars_total >= res.sheet_cap) {
      add(sheetCapLine(res.sheet_cap));
    }
    if (!lines.length) add("I checked your worksheet.");
    return lines;
  }

  function retakeText(res) {
    if (res && res.reason) return String(res.reason);
    return RETAKE;
  }

  function anyWrong(problems) {
    var wrong = false;
    (problems || []).forEach(function (problem) {
      if (problem && !problem.correct) wrong = true;
    });
    return wrong;
  }

  function stopLines() {
    if (lineTimer) clearInterval(lineTimer);
    lineTimer = null;
  }

  function haltTimers() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    if (waitTimer) clearTimeout(waitTimer);
    waitTimer = null;
  }

  function stopPolling() {
    haltTimers();
    pollId = "";
    stopLines();
  }

  function clearApp() {
    stopLines();
    app.innerHTML = "";
  }

  function iconFor(status) {
    if (status === "checked") return "✅";
    if (status === "checking") return "🔎";
    if (status === "retake") return "📷";
    if (status === "not_homework") return "🤔";
    if (status === "duplicate" || status === "near_duplicate") return "🔁";
    return "📝";
  }

  function prettyDate(value) {
    var text = value == null ? "" : String(value);
    if (!text) return "";
    var parsed = Date.parse(text.length === 10 ? text + "T12:00:00" : text);
    if (isNaN(parsed)) return text;
    try {
      return new Date(parsed).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (err) {
      return text;
    }
  }

  function showHistory(sheets) {
    var old = document.querySelector(".hw-history");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var wrap = el("section", "hw-history");
    wrap.setAttribute("data-history", "ready");
    wrap.appendChild(el("h2", "hw-history-title", "My homework"));
    if (!sheets || !sheets.length) {
      wrap.appendChild(el("p", "hw-note", "No worksheets yet."));
      app.appendChild(wrap);
      return;
    }
    var list = document.createElement("ul");
    list.className = "hw-history-list";
    sheets.forEach(function (sheet) {
      var item = document.createElement("li");
      item.className = "hw-history-item";
      var icon = el("span", "hw-history-icon", iconFor(sheet && sheet.status));
      icon.setAttribute("aria-hidden", "true");
      item.appendChild(icon);
      item.appendChild(el("span", "hw-history-date", prettyDate(sheet && sheet.date)));
      var score = sheet && sheet.score != null && String(sheet.score) !== "" ? String(sheet.score) : "—";
      item.appendChild(el("span", "hw-history-score", score));
      var stars = sheet && (typeof sheet.stars === "number" ? sheet.stars : sheet.stars_earned);
      item.appendChild(el("span", "hw-history-stars", (typeof stars === "number" ? stars : 0) + " ⭐"));
      list.appendChild(item);
    });
    wrap.appendChild(list);
    app.appendChild(wrap);
  }

  function showPick() {
    stopPolling();
    clearApp();
    app.setAttribute("data-screen", "pick");
    app.removeAttribute("data-wait");
    app.appendChild(el("h1", "hw-title", "Homework"));
    app.appendChild(el("p", "hw-lead", "Take a picture of one worksheet."));
    var hear = hearButton("Take a picture of one worksheet.", "Hear it");
    if (hear) app.appendChild(hear);
    app.appendChild(shootLabel("Take a photo of your worksheet", false));
    speak("Take a picture of one worksheet.");
    window.HomeworkCheck.list().then(function (res) {
      if (app.getAttribute("data-screen") !== "pick") return;
      var sheets = (res && (res.sheets || res.homework || res.items)) || [];
      showHistory(sheets);
    }, function () { /* the camera still works without the list */ });
  }

  function startLines() {
    stopLines();
    lineStep = 0;
    lineTimer = setInterval(function () {
      var node = document.getElementById("hw-line");
      if (!node) return;
      lineStep += 1;
      node.textContent = LINES[lineStep % LINES.length];
    }, 4000);
  }

  function showChecking() {
    clearApp();
    app.setAttribute("data-screen", "checking");
    app.removeAttribute("data-wait");
    var face = el("p", "hw-check-face", "🔎");
    face.setAttribute("aria-hidden", "true");
    app.appendChild(face);
    app.appendChild(el("h1", "hw-title", "Checking…"));
    var line = el("p", "hw-line", LINES[0]);
    line.id = "hw-line";
    line.setAttribute("role", "status");
    app.appendChild(line);
    if (window.speechSynthesis) {
      var lineHear = document.createElement("button");
      lineHear.type = "button";
      lineHear.className = "hw-hear";
      lineHear.textContent = "Hear it";
      lineHear.addEventListener("click", function () {
        var current = document.getElementById("hw-line");
        speak(current ? current.textContent : LINES[0]);
      });
      app.appendChild(lineHear);
    }
    app.appendChild(el("p", "hw-lead", CHAT_LINE));
    var chatHear = hearButton(CHAT_LINE, "Hear it");
    if (chatHear) app.appendChild(chatHear);
    speak(LINES[0] + ". " + CHAT_LINE);
    startLines();
  }

  function longWaitLimit() {
    if (window.HomeworkCheck && HomeworkCheck.slowMock && HomeworkCheck.slowMock()) return SLOW_LONG_MS;
    return LONG_MS;
  }

  function showLongWait() {
    if (document.getElementById("hw-long")) return;
    if (app.getAttribute("data-screen") !== "checking") return;
    app.setAttribute("data-wait", "long");
    var note = el("p", "hw-lead", LONG_WAIT);
    note.id = "hw-long";
    note.setAttribute("role", "status");
    app.appendChild(note);
    var hear = hearButton(LONG_WAIT, "Hear it");
    if (hear) app.appendChild(hear);
    var home = document.createElement("a");
    home.className = "hw-shoot hw-home";
    home.href = "../index.html";
    home.textContent = "Go home";
    app.appendChild(home);
    speak(LONG_WAIT);
  }

  function armLongWait() {
    if (waitTimer) clearTimeout(waitTimer);
    var delay = longWaitLimit() - (Date.now() - pollSince);
    if (delay <= 0) {
      showLongWait();
      return;
    }
    waitTimer = setTimeout(showLongWait, delay);
  }

  function showStatus(screen, text) {
    stopPolling();
    clearApp();
    app.setAttribute("data-screen", screen);
    app.removeAttribute("data-wait");
    app.appendChild(el("h1", "hw-title", "Homework"));
    var note = el("p", "hw-lead", text);
    note.setAttribute("role", "status");
    app.appendChild(note);
    var hear = hearButton(text, "Hear it");
    if (hear) app.appendChild(hear);
    app.appendChild(shootLabel("Take a photo of your worksheet", false));
    speak(text);
  }

  function chime(step) {
    unlockAudio();
    if (!audioCtx) return;
    var notes = [523.25, 659.25, 783.99, 1046.5];
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[step % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  function sparkle(rect) {
    var dots = 6;
    var i;
    for (i = 0; i < dots; i += 1) {
      var dot = el("span", "hw-spark");
      var angle = (Math.PI * 2 * i) / dots;
      dot.style.left = (rect.left + rect.width / 2) + "px";
      dot.style.top = (rect.top + rect.height / 2) + "px";
      dot.style.setProperty("--dx", Math.round(Math.cos(angle) * 28) + "px");
      dot.style.setProperty("--dy", Math.round(Math.sin(angle) * 28) + "px");
      document.body.appendChild(dot);
      (function (node) {
        setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 520);
      })(dot);
    }
  }

  function flyStars(count, balance) {
    var bar = document.getElementById("starbar");
    var start = typeof balance === "number" ? balance - count : null;
    if (start != null && start < 0) start = 0;
    if (start != null && bar) bar.textContent = "★ " + start;
    var origin = document.querySelector(".hw-title") || app;
    var box = origin.getBoundingClientRect();
    var from = {
      left: box.left,
      top: Math.min(box.bottom + 70, window.innerHeight * 0.55),
      width: box.width,
      height: 36
    };
    var n;
    for (n = 0; n < count; n += 1) {
      (function (step) {
        setTimeout(function () { launch(from, step, start); }, step * 520);
      })(n);
    }
    setTimeout(function () {
      if (window.KidsStars && KidsStars.applyStars) KidsStars.applyStars(balance);
      else if (bar && typeof balance === "number") bar.textContent = "★ " + balance;
    }, count * 520 + 760);
  }

  function launch(from, step, start) {
    var bar = document.getElementById("starbar");
    var star = el("span", "hw-fly", "⭐");
    star.style.left = (from.left + from.width / 2 - 16) + "px";
    star.style.top = (from.top + 8) + "px";
    document.body.appendChild(star);
    var to = bar ? bar.getBoundingClientRect() : { left: from.left, top: 8, width: 48, height: 48 };
    var dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    var dy = (to.top + to.height / 2) - (from.top + 24);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        star.style.transform = "translate(" + dx + "px, " + dy + "px) scale(0.72)";
      });
    });
    setTimeout(function () {
      sparkle(to);
      chime(step);
      if (bar && start != null) bar.textContent = "★ " + (start + step + 1);
      if (star.parentNode) star.parentNode.removeChild(star);
    }, 720);
  }

  function showResults(res) {
    stopPolling();
    clearPending();
    if (res.sheet_id) sheetId = String(res.sheet_id);
    var earned = typeof res.stars_earned === "number" ? res.stars_earned : 0;
    var lines = resultLines(res);
    var problems = res.problems || [];
    clearApp();
    app.setAttribute("data-screen", "results");
    if (lines.indexOf(DAILY) !== -1) app.setAttribute("data-cap", "daily");
    else app.removeAttribute("data-cap");
    if (typeof res.sheet_cap === "number" && typeof res.sheet_stars_total === "number" && res.sheet_stars_total >= res.sheet_cap) {
      app.setAttribute("data-sheet-cap", "1");
    } else app.removeAttribute("data-sheet-cap");
    app.setAttribute("data-earned", String(earned));

    lines.forEach(function (line, index) {
      var node = el(index === 0 ? "h1" : "p", index === 0 ? "hw-title" : "hw-lead", line);
      if (index === 0) node.setAttribute("role", "status");
      app.appendChild(node);
      var hear = hearButton(line, "Hear it");
      if (hear) app.appendChild(hear);
    });

    if (problems.length) {
      var list = document.createElement("ol");
      list.className = "hw-list";
      problems.forEach(function (problem, index) {
        var number = problem && problem.n != null ? problem.n : index + 1;
        var item = document.createElement("li");
        item.className = problem && problem.correct ? "hw-problem hw-yes" : "hw-problem hw-soft";
        item.appendChild(el("span", "hw-n", String(number)));
        item.appendChild(el("span", "hw-mark", problem && problem.correct ? "✅" : "🤔"));
        if (!(problem && problem.correct)) {
          var hint = problem && problem.hint ? String(problem.hint) : "Try this one again.";
          item.appendChild(el("p", "hw-hint", hint));
          var noHear = hearButton("Problem " + number + ". " + hint, "Hear the hint");
          if (noHear) item.appendChild(noHear);
        }
        list.appendChild(item);
      });
      app.appendChild(list);
    }

    if (anyWrong(problems)) {
      app.appendChild(shootLabel("Fix it and take a new photo", true));
      app.appendChild(el("p", "hw-note", NEWLY));
      var noteHear = hearButton(NEWLY, "Hear it");
      if (noteHear) app.appendChild(noteHear);
    } else {
      app.appendChild(shootLabel("Take a photo of your worksheet", false));
    }

    speak(lines.join(" "));
    if (earned > 0) flyStars(Math.min(earned, 12), res.balance);
    else if (window.KidsStars && KidsStars.applyStars) KidsStars.applyStars(res.balance);
  }

  function showResponse(res) {
    if (res && res.status === "checking") return;
    if (res && res.sheet_id) sheetId = String(res.sheet_id);
    var done = res && (
      res.status === "checked" || res.status === "retake" || res.status === "not_homework" ||
      res.status === "duplicate" || res.error === "duplicate" || res.error === "near_duplicate" ||
      res.error === "daily_cap"
    );
    if (done) clearPending();
    if (res && (res.status === "checked" || (res.error === "daily_cap" && res.problems))) {
      showResults(res);
      return;
    }
    if (res && res.error === "daily_cap") {
      showStatus("message", res.message ? String(res.message) : DAILY);
      return;
    }
    if (res && res.status === "retake") {
      showStatus("retake", retakeText(res));
      return;
    }
    if (res && (res.status === "duplicate" || res.error === "duplicate" || res.error === "near_duplicate")) {
      showStatus("duplicate", res.message ? String(res.message) : DUPLICATE);
      return;
    }
    if (res && res.status === "not_homework") {
      showStatus("not_homework", res.message ? String(res.message) : NOT_HOMEWORK);
      return;
    }
    showStatus("message", messageFor(res));
  }

  function askStatus() {
    var id = pollId;
    if (!id) return;
    window.HomeworkCheck.status(id).then(function (res) {
      if (pollId !== id) return;
      if (!res || res.error === "slow_down" || res.error === "asleep" || res.error === "server_error" || res.error === "not_configured" || res.error === "origin_not_allowed") {
        return;
      }
      if (res.error === "locked" || res.error === "no_passcode_yet") {
        showStatus("message", messageFor(res));
        return;
      }
      var status = res.status || "";
      if (!status || status === "checking") {
        if (Date.now() - pollSince >= longWaitLimit()) showLongWait();
        return;
      }
      if (!res.sheet_id) res.sheet_id = id;
      showResponse(res);
    }, function () { /* the next poll tries again */ });
  }

  function beginPolling(id, since) {
    haltTimers();
    pollId = id;
    pollSince = since || Date.now();
    sheetId = id;
    showChecking();
    armLongWait();
    askStatus();
    pollTimer = setInterval(askStatus, POLL_MS);
  }

  function onFile() {
    if (busy) return;
    var file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    busy = true;
    var earlier = resubmit ? sheetId : "";
    resubmit = false;
    haltTimers();
    pollId = "";
    showChecking();
    window.HomeworkPhoto.prepare(file).then(function (photo) {
      return window.HomeworkCheck.upload({ imageBase64: photo.base64, resubmitOf: earlier });
    }).then(function (res) {
      busy = false;
      if (res && (res.error === "duplicate" || res.error === "near_duplicate")) {
        clearPending();
        showStatus("duplicate", res.message ? String(res.message) : DUPLICATE);
        return;
      }
      if (res && res.sheet_id && res.ok !== false && res.error !== "locked" && res.error !== "no_passcode_yet") {
        var since = Date.now();
        remember(String(res.sheet_id), since);
        beginPolling(String(res.sheet_id), since);
        return;
      }
      showStatus("message", messageFor(res));
    }, function () {
      busy = false;
      showStatus("message", "I couldn't use that photo. Try again.");
    });
  }

  function homeworkOn() {
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (feats) return !!feats.homework;
    var cfg = window.KIDS_CHAT || {};
    return !!String(cfg.functionsUrl || "");
  }

  function showOff() {
    clearApp();
    app.setAttribute("data-screen", "off");
    app.appendChild(el("h1", "hw-title", "Homework"));
    app.appendChild(el("p", "hw-lead", "Homework photos need the star server. The games still work without it."));
    var home = el("a", "home-link", "← Home");
    home.href = "../index.html";
    app.appendChild(home);
  }

  if (!homeworkOn()) showOff();
  else {
    var pending = readPending();
    if (pending) beginPolling(String(pending.sheetId), Number(pending.since) || Date.now());
    else showPick();
  }
})();
