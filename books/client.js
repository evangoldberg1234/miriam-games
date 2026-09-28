/* Book Club calls. The server is the authority. Mock mode (?starsmock=1)
   returns pretend books, including a short one, and does not use the
   network. Read kid and functionsUrl from window.KIDS_CHAT. */
(function () {
  function config() {
    var cfg = window.KIDS_CHAT || {};
    return {
      kid: cfg.kid || "",
      botName: cfg.botName || "your guide",
      functionsUrl: String(cfg.functionsUrl || "").replace(/\/+$/, "")
    };
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

  function cover(color, letter) {
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='320'>" +
      "<rect width='240' height='320' rx='18' fill='" + color + "'/>" +
      "<text x='120' y='186' text-anchor='middle' font-size='120' font-family='Georgia, serif' fill='white'>" +
      letter + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function botName() {
    return config().botName;
  }

  function mockBooks() {
    return [
      { work_id: "cw", title: "Charlotte's Web", author: "E. B. White", cover_url: cover("#2b86f0", "C"), pages: 184, pages_source: "mock" },
      { work_id: "frog", title: "Frog and Toad Are Friends", author: "Arnold Lobel", cover_url: "", pages: 64, pages_source: "mock" },
      { work_id: "zoo", title: "Dear Zoo", author: "Rod Campbell", cover_url: cover("#e07a3d", "Z"), pages: 18, pages_source: "mock" },
      { work_id: "matilda", title: "Matilda", author: "Roald Dahl", cover_url: cover("#7a4eab", "M"), pages: 240, pages_source: "mock" },
      { work_id: "twice", title: "The Tale of Peter Rabbit", author: "Beatrix Potter", cover_url: cover("#c45c26", "P"), pages: 72, pages_source: "mock" },
      { work_id: "box", title: "The Boxcar Children", author: "Gertrude Chandler Warner", cover_url: cover("#1f8a4c", "B"), pages: null, pages_source: "" }
    ];
  }

  function mockResult(body) {
    var name = botName();
    if (body.action === "lookup") return { ok: true, results: mockBooks(), mock: true };
    if (body.action === "list") {
      return {
        ok: true,
        books: [
          { title: "Charlotte's Web", author: "E. B. White", pages: 184, cover_url: cover("#2b86f0", "C"), status: "earned", date: "2026-09-20", stars: 20, score: 5 },
          { title: "Frog and Toad Are Friends", author: "Arnold Lobel", pages: 64, cover_url: "", status: "waiting", date: "2026-09-26", stars: 0, score: null },
          { title: "Matilda", author: "Roald Dahl", pages: 240, cover_url: cover("#7a4eab", "M"), status: "check", date: "2026-09-27", stars: 0, score: null },
          { title: "Dear Zoo", author: "Rod Campbell", pages: 18, cover_url: cover("#e07a3d", "Z"), status: "too_short", date: "2026-09-18", stars: 0, score: null },
          { title: "The Tale of Peter Rabbit", author: "Beatrix Potter", pages: 72, cover_url: cover("#c45c26", "P"), status: "tried_twice", date: "2026-09-25", stars: 0, score: null }
        ],
        mock: true
      };
    }
    if (body.action === "start") {
      var id = body.work_id;
      if (id === "zoo") {
        return {
          ok: true,
          status: "too_short",
          pages: 18,
          min_pages: 50,
          book_id: "zoo",
          message: "This book is shorter than 50 pages, so it doesn't earn stars, but reading is always awesome!",
          mock: true
        };
      }
      if (id === "matilda") {
        return {
          ok: true,
          status: "already_paid",
          pages: 240,
          min_pages: 50,
          book_id: "matilda",
          message: "You already got your stars for this book! 🌟",
          mock: true
        };
      }
      if (id === "box") {
        return {
          ok: true,
          status: "pages_unknown",
          pages: null,
          min_pages: 50,
          book_id: "box",
          message: "Great reading! Now tell " + name + " about your book in the chat 💬",
          mock: true
        };
      }
      if (id === "frog") {
        return {
          ok: true,
          status: "in_progress",
          pages: 64,
          min_pages: 50,
          book_id: "frog",
          message: "You're already telling " + name + " about this book, open the chat!",
          mock: true
        };
      }
      if (id === "twice") {
        return {
          ok: true,
          status: "tried_twice",
          pages: 72,
          min_pages: 50,
          book_id: "twice",
          message: "You already tried this book twice. Pick a different one!",
          mock: true
        };
      }
      return {
        ok: true,
        status: "check",
        pages: 184,
        min_pages: 50,
        book_id: "cw",
        message: "Great reading! Now tell " + name + " about your book in the chat 💬",
        mock: true
      };
    }
    return { ok: false, error: "asleep", mock: true };
  }

  var UNTRUSTED = ["amount", "balance", "price", "cost", "cap", "delta", "stars", "stars_earned", "score", "earned"];

  function saveToken(value) {
    if (mockOn()) return;
    var kid = config().kid;
    if (!kid || !value) return;
    try { localStorage.setItem("kidsChat." + kid + ".token", String(value)); } catch (err) { /* the page can still show the reply */ }
  }

  function post(body) {
    if (mockOn()) return Promise.resolve(mockResult(body || {}));
    var cfg = config();
    if (!cfg.functionsUrl) return Promise.resolve({ ok: false, error: "locked" });
    var payload = {};
    Object.keys(body || {}).forEach(function (key) {
      if (key === "pages" || key === "min_pages" || key === "page_count") return;
      if (UNTRUSTED.indexOf(key) !== -1) return;
      payload[key] = body[key];
    });
    var auth = token();
    if (auth) payload.token = auth;
    payload.kid = cfg.kid;
    return fetch(cfg.functionsUrl + "/kid-books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        data = data || {};
        if ((res.ok || data.ok === true) && data.token) saveToken(data.token);
        if (res.status === 401 || data.error === "locked" || data.error === "bad_token" || data.error === "token_expired") {
          return { ok: false, error: "locked", message: data.message };
        }
        if (res.status === 400) {
          return { ok: false, error: data.error || "bad_work_id", message: data.message };
        }
        if (res.status === 404) {
          if (data.error === "book_not_found") return { ok: false, error: "book_not_found", message: data.message };
          return { ok: false, error: "asleep" };
        }
        if (res.status === 429) {
          return {
            ok: false,
            error: data.error || "slow_down",
            message: data.message,
            retry_after: data.retry_after
          };
        }
        if (res.status === 502) {
          return { ok: false, error: data.error || "library_unavailable", message: data.message };
        }
        if (res.status === 403 && data.error === "no_passcode_yet") return { ok: false, error: "no_passcode_yet", message: data.message };
        if (res.status === 403 && data.error === "origin_not_allowed") return { ok: false, error: "origin_not_allowed", message: data.message };
        if (res.status === 503 || data.error === "not_configured") return { ok: false, error: "not_configured", message: data.message };
        if (res.status === 500 || data.error === "server_error") return { ok: false, error: "server_error", message: data.message };
        if (!res.ok && !data.error) return { ok: false, error: "asleep" };
        if (Array.isArray(data.results)) data.results = data.results.slice(0, 5);
        return data;
      });
    }).catch(function () {
      return { ok: false, error: "asleep" };
    });
  }

  window.KidBooks = {
    mockOn: mockOn,
    lookup: function (title, author) {
      var body = { action: "lookup", title: String(title || "") };
      if (author) body.author = String(author);
      return post(body);
    },
    start: function (workId) {
      return post({ action: "start", work_id: String(workId || "") });
    },
    list: function () {
      return post({ action: "list" });
    }
  };
})();
