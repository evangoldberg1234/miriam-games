/* Star ledger. The server is the authority. This file displays a balance
   the server already decided, and sends earn, spend, and level-sync calls.
   Requests never include a star amount, price, or balance for the server
   to trust. Mock mode (?starsmock=1) stays in memory: it does not call the
   server, and it does not write the saved token or a saved balance.
   Read kid id and functionsUrl from window.KIDS_CHAT. A new game is charged
   in chat, so this file never sends spend reason "game". */
(function () {
  var HINT_COST = 5;
  var GAME_COST = 20;
  (function readPrices() {
    var prices = window.KIDS_SETTINGS && window.KIDS_SETTINGS.starPrices;
    if (!prices) return;
    if (typeof prices.animalPuzzleHint === "number") HINT_COST = prices.animalPuzzleHint;
    if (typeof prices.newGame === "number") GAME_COST = prices.newGame;
  })();
  var DAILY_CAP = 100;
  var CAP_TEXT = "You've earned all your stars for today!";
  var SUBJECTS = { math: 1, verbal: 1, english: 1, hebrew: 1, russian: 1, parsha: 1 };
  var mockBalance = null;
  var mockEarnedToday = 0;
  var mockLevels = {};
  var lastSeen = null;
  var listeners = [];

  function config() {
    var cfg = window.KIDS_CHAT || {};
    return {
      kid: cfg.kid || "",
      kidName: cfg.kidName || "Friend",
      botName: cfg.botName || "your guide",
      functionsUrl: String(cfg.functionsUrl || "").replace(/\/+$/, ""),
      stars: cfg.stars !== false
    };
  }

  function starsEnabled() {
    var cfg = config();
    return !!(cfg.functionsUrl && cfg.stars);
  }

  function mockOn() {
    try {
      return /(?:^|[?&])starsmock=1(?:&|$)/.test(window.location.search);
    } catch (err) {
      return false;
    }
  }

  function token() {
    var kid = config().kid;
    if (!kid) return "";
    try {
      return localStorage.getItem("kidsChat." + kid + ".token") || "";
    } catch (err) {
      return "";
    }
  }

  /* The server decides stars. These keys are never copied into a request. */
  var UNTRUSTED = ["amount", "balance", "price", "cost", "cap", "delta", "stars", "stars_earned", "score", "earned"];

  function untrusted(key) {
    return UNTRUSTED.indexOf(key) !== -1;
  }

  function saveToken(value) {
    if (mockOn()) return;
    var kid = config().kid;
    if (!kid || !value) return;
    try { localStorage.setItem("kidsChat." + kid + ".token", String(value)); } catch (err) { /* display still works */ }
  }

  function pushChat(balance) {
    if (typeof balance !== "number") return;
    if (!window.KidsChat || !KidsChat.setStars) return;
    try { KidsChat.setStars(balance); } catch (err) { /* the page counter still updates */ }
  }

  function clampLevel(n) {
    n = Math.round(Number(n));
    if (!n || n < 1) return 1;
    if (n > 10) return 10;
    return n;
  }

  function cleanLevels(levels) {
    var out = {};
    if (!levels || typeof levels !== "object") return out;
    Object.keys(SUBJECTS).forEach(function (name) {
      if (!Object.prototype.hasOwnProperty.call(levels, name)) return;
      var n = Math.round(Number(levels[name]));
      if (n >= 1 && n <= 10) out[name] = n;
    });
    return out;
  }

  function atCap(res) {
    if (!res) return false;
    if (res.error === "daily_cap") return true;
    if (typeof res.earned_today !== "number" || typeof res.daily_cap !== "number") return false;
    return res.earned_today >= res.daily_cap;
  }

  function capEl() {
    var el = document.getElementById("starcap");
    var bar = document.getElementById("starbar");
    if (!bar) return el;
    if (!el) {
      el = document.createElement("p");
      el.id = "starcap";
      el.className = "star-cap";
      el.setAttribute("role", "status");
      el.hidden = true;
    }
    var top = bar.closest ? bar.closest(".quest-top") : null;
    if (top && top.parentNode) {
      if (el.parentNode !== top.parentNode) top.parentNode.insertBefore(el, top.nextSibling);
    } else if (el.parentNode !== bar.parentNode) {
      bar.parentNode.insertBefore(el, bar.nextSibling);
    }
    return el;
  }

  function showCap(res) {
    var el = capEl();
    if (!el) return;
    if (atCap(res)) {
      el.hidden = false;
      el.textContent = CAP_TEXT;
      return;
    }
    if (res && typeof res.earned_today === "number" && typeof res.daily_cap === "number") {
      el.hidden = true;
      el.textContent = "";
    }
  }

  function emit(res) {
    if (res && typeof res.balance === "number") {
      lastSeen = res.balance;
      pushChat(res.balance);
    }
    listeners.forEach(function (fn) {
      try { fn(res); } catch (err) { /* a listener must not break the ledger */ }
    });
    paint(res);
    return res;
  }

  function paint(res) {
    var el = document.getElementById("starbar");
    if (el && !starsEnabled()) {
      el.hidden = true;
      el.style.display = "none";
    }
    if (!starsEnabled()) return;
    if (!el) {
      showCap(res);
      return;
    }
    if (!res) {
      el.textContent = "★";
      return;
    }
    if (typeof res.balance === "number" && res.error !== "locked") el.textContent = "★ " + res.balance;
    if (res.ok) {
      el.textContent = "★ " + res.balance;
      showCap(res);
      return;
    }
    if (res.error === "locked") {
      el.textContent = "Ask a grown-up to unlock stars";
      showCap({ earned_today: 0, daily_cap: DAILY_CAP });
      return;
    }
    if (res.error === "no_passcode_yet") {
      el.textContent = "Ask a grown-up to set up stars";
      showCap({ earned_today: 0, daily_cap: DAILY_CAP });
      return;
    }
    if (res.error === "server_error") {
      el.textContent = "Stars are napping, try again soon";
      showCap({ earned_today: 0, daily_cap: DAILY_CAP });
      return;
    }
    if (res.error === "daily_cap" || res.error === "slow_down" || res.error === "not_enough_stars") {
      showCap(res);
      return;
    }
    el.textContent = "Stars are waking up...";
    showCap({ earned_today: 0, daily_cap: DAILY_CAP });
  }

  function mockResult(body) {
    if (mockBalance == null) mockBalance = 20;
    var kid = config().kid;
    if (body.action === "balance") {
      return { ok: true, kid: kid, balance: mockBalance, earned_today: mockEarnedToday, daily_cap: DAILY_CAP, mock: true };
    }
    if (body.action === "earn") {
      if (mockEarnedToday >= DAILY_CAP) {
        return { ok: false, error: "daily_cap", balance: mockBalance, earned_today: mockEarnedToday, daily_cap: DAILY_CAP, mock: true };
      }
      mockBalance += 1;
      mockEarnedToday += 1;
      return { ok: true, balance: mockBalance, earned: 1, earned_today: mockEarnedToday, daily_cap: DAILY_CAP, mock: true };
    }
    if (body.action === "spend") {
      if (mockBalance < HINT_COST) {
        return {
          ok: false,
          error: "not_enough_stars",
          balance: mockBalance,
          cost: HINT_COST,
          need: HINT_COST - mockBalance,
          message: "Not enough stars. A hint costs 5. You have " + mockBalance + ".",
          mock: true
        };
      }
      mockBalance -= HINT_COST;
      return { ok: true, balance: mockBalance, cost: HINT_COST, mock: true };
    }
    if (body.action === "get_levels") {
      return { ok: true, levels: mockLevels, mock: true };
    }
    if (body.action === "set_levels") {
      mockLevels = cleanLevels(body.levels);
      return { ok: true, levels: mockLevels, mock: true };
    }
    return { ok: false, error: "asleep", mock: true };
  }

  function post(body, path) {
    if (mockOn()) {
      if (path === "/kid-homework") return Promise.resolve({ ok: false, error: "mock", mock: true });
      return Promise.resolve(mockResult(body));
    }
    var cfg = config();
    var auth = token();
    if (!auth || !cfg.functionsUrl) return Promise.resolve({ ok: false, error: "locked" });
    var payload = {};
    Object.keys(body || {}).forEach(function (key) {
      if (untrusted(key)) return;
      payload[key] = body[key];
    });
    payload.token = auth;
    payload.kid = cfg.kid;
    return fetch(cfg.functionsUrl + (path || "/kid-stars"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        data = data || {};
        if ((res.ok || data.ok === true) && data.token) saveToken(data.token);
        if (res.status === 401 || data.error === "locked" || data.error === "bad_token" || data.error === "token_expired") {
          return { ok: false, error: "locked" };
        }
        if (res.status === 404) return { ok: false, error: "asleep" };
        if (res.status === 402) {
          return {
            ok: false,
            error: data.error || "not_enough_stars",
            balance: data.balance,
            cost: data.cost,
            need: data.need,
            message: data.message
          };
        }
        if (res.status === 409) {
          return { ok: false, error: data.error || "duplicate", message: data.message };
        }
        if (res.status === 429) {
          var reason = data.error === "daily_cap" ? "daily_cap" : "slow_down";
          return {
            ok: false,
            error: reason,
            balance: data.balance,
            earned_today: data.earned_today,
            daily_cap: data.daily_cap,
            retry_after: data.retry_after,
            status: data.status,
            sheet_id: data.sheet_id,
            problems: data.problems,
            stars_earned: data.stars_earned,
            sheet_stars_total: data.sheet_stars_total,
            sheet_cap: data.sheet_cap,
            daily_remaining: data.daily_remaining
          };
        }
        if (res.status === 403 && data.error === "no_passcode_yet") return { ok: false, error: "no_passcode_yet" };
        if (res.status === 403 && data.error === "origin_not_allowed") return { ok: false, error: "origin_not_allowed" };
        if (res.status === 503 || data.error === "not_configured") return { ok: false, error: "not_configured" };
        if (res.status === 500 || data.error === "server_error") return { ok: false, error: "server_error" };
        if (!res.ok && !data.error) return { ok: false, error: "asleep" };
        return data;
      });
    }).catch(function () {
      return { ok: false, error: "asleep" };
    });
  }

  function call(body) {
    if (!starsEnabled() && !mockOn()) return Promise.resolve({ ok: false, error: "locked" });
    return post(body).then(emit);
  }

  function quiet(body) {
    return post(body).then(function (res) {
      if (!res || res.ok !== true) return { ok: false };
      return res;
    }, function () {
      return { ok: false };
    });
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function messageFor(res) {
    if (!res || res.ok) return "";
    if (res.error === "locked") return "Ask a grown-up to unlock stars. Open the chat bubble and enter the family code.";
    if (res.error === "no_passcode_yet") return "Ask a grown-up to set up stars";
    if (res.error === "server_error") return "Stars are napping, try again soon";
    if (res.error === "not_enough_stars") {
      if (res.message) return String(res.message);
      var have = typeof res.balance === "number" ? res.balance : 0;
      return "Not enough stars. A hint costs " + HINT_COST + ". You have " + have + ".";
    }
    if (res.error === "daily_cap") return CAP_TEXT;
    if (res.error === "slow_down") return "";
    return "Stars are waking up...";
  }

  function earn(opts) {
    opts = opts || {};
    var subject = String(opts.subject || "");
    if (!SUBJECTS[subject]) return Promise.resolve(emit({ ok: false, error: "asleep" }));
    /* What happened. The server decides whether this earns a star. */
    var questionId = String(opts.question_id || opts.qid || "");
    var body = {
      action: "earn",
      subject: subject,
      question_id: questionId,
      qid: questionId,
      answer: opts.answer == null ? "" : String(opts.answer),
      level: clampLevel(opts.level)
    };
    return post(body).then(function (res) {
      if (res.error !== "slow_down") return res;
      var seconds = Number(res.retry_after);
      if (!(seconds >= 0)) seconds = 2;
      return wait(seconds * 1000).then(function () { return post(body); });
    }).then(emit);
  }

  function spend(opts) {
    opts = opts || {};
    if (opts.reason && opts.reason !== "hint") return Promise.resolve({ ok: false, error: "hint_only" });
    /* No amount. The server prices a hint. */
    return call({ action: "spend", reason: "hint", item: String(opts.item || "") });
  }

  function labelFor(level) {
    if (window.Staircase && Staircase.labelFor) return Staircase.labelFor(level);
    return "Level " + level;
  }

  function syncLevels() {
    if (!starsEnabled()) return Promise.resolve({ ok: true, source: "local" });
    if (!window.LevelStore) return Promise.resolve({ ok: false });
    var data;
    try { data = window.LevelStore.load(); } catch (err) { return Promise.resolve({ ok: false }); }
    if (data.results && Object.keys(data.results).length) return Promise.resolve({ ok: true, source: "local" });
    return quiet({ action: "get_levels" }).then(function (res) {
      try {
        if (!res.ok || !res.levels) return { ok: false };
        var clean = cleanLevels(res.levels);
        var names = Object.keys(clean);
        if (!names.length) return { ok: false };
        data = window.LevelStore.load();
        if (data.results && Object.keys(data.results).length) return { ok: true, source: "local" };
        var stamp = new Date().toISOString().slice(0, 10);
        names.forEach(function (name) {
          var level = clean[name];
          data.results[name] = { level: level, label: labelFor(level), questions: 0, at: stamp };
        });
        window.LevelStore.save(data);
        return { ok: true, source: "server", levels: clean };
      } catch (err2) {
        return { ok: false };
      }
    }, function () {
      return { ok: false };
    });
  }

  function setLevels(levels) {
    /* Practice difficulty only. This does not award stars. */
    var clean = cleanLevels(levels);
    if (!Object.keys(clean).length) return Promise.resolve({ ok: false });
    if (!starsEnabled()) return Promise.resolve({ ok: true, source: "local", levels: clean });
    return quiet({ action: "set_levels", levels: clean });
  }

  window.KidsStars = {
    HINT_COST: HINT_COST,
    GAME_COST: GAME_COST,
    CAP_TEXT: CAP_TEXT,
    mockOn: mockOn,
    atCap: atCap,
    capMessage: function () { return CAP_TEXT; },
    lastBalance: function () {
      return lastSeen;
    },
    onChange: function (fn) { listeners.push(fn); },
    messageFor: messageFor,
    balance: function () { return call({ action: "balance" }); },
    postJson: function (path, body) { return post(body, path); },
    applyStars: function (balance) {
      if (typeof balance !== "number") return;
      lastSeen = balance;
      paint({ ok: true, balance: balance });
      pushChat(balance);
    },
    earn: earn,
    spend: spend,
    getLevels: function () { return quiet({ action: "get_levels" }); },
    setLevels: setLevels,
    syncLevels: syncLevels,
    paint: paint
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof lastSeen === "number") pushChat(lastSeen);
  });

  window.addEventListener("kidschat:stars", function (event) {
    var detail = (event && event.detail) || {};
    var kid = config().kid;
    if (detail.kid && kid && String(detail.kid) !== String(kid)) return;
    if (typeof detail.stars !== "number") return;
    lastSeen = detail.stars;
    paint({ ok: true, balance: detail.stars });
  });

  var newGame = document.getElementById("new-game");
  if (newGame) {
    newGame.addEventListener("click", function () {
      if (window.KidsChat && KidsChat.requestGame) {
        KidsChat.requestGame("I want a new game!");
        return;
      }
      var fab = document.querySelector(".kc-fab");
      if (fab) fab.click();
    });
  }

  if (starsEnabled() && document.getElementById("starbar")) {
    window.KidsStars.balance();
  }
})();
