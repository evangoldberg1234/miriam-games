/* Homework photo check. Posts through KidsStars.postJson so the device
   token, renewed token, and error mapping match the star ledger.
   ?starsmock=1 simulates the contract in memory and does not call the
   server. Each upload cycles through the screens. Status stays "checking"
   until about 6 seconds have passed, then returns the result. slow stays
   on checking. The upload never sends a star amount. */
(function () {
  var ORDER = ["checked", "retake", "duplicate", "not_homework", "cap", "slow"];
  var MOCK_READY = 6000;
  var NOT_HOMEWORK = "Hmm, that doesn't look like a worksheet.";
  var DAILY = "You've earned all 20 homework stars today! Your answers are still checked.";
  var mockReadyAt = 0;
  var mockResubmit = false;

  function mockOn() {
    if (window.KidsStars && KidsStars.mockOn) return KidsStars.mockOn();
    try {
      return /(?:^|[?&])starsmock=1(?:&|$)/.test(window.location.search);
    } catch (err) {
      return false;
    }
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function storedKind() {
    try { return sessionStorage.getItem("kidsHomework.mockKind") || ""; } catch (err) { return ""; }
  }

  function nextKind() {
    var step = 0;
    try { step = Number(sessionStorage.getItem("kidsHomework.mockStep") || "0"); } catch (err) { step = 0; }
    if (!(step >= 0)) step = 0;
    var kind = ORDER[step % ORDER.length];
    try { sessionStorage.setItem("kidsHomework.mockStep", String(step + 1)); } catch (err2) { /* keep going */ }
    return kind;
  }

  function kindNow() {
    return storedKind() || "checked";
  }

  function problems(wrongFrom) {
    var list = [];
    var n;
    for (n = 1; n <= 10; n += 1) {
      if (n >= wrongFrom) {
        list.push({
          n: n,
          correct: false,
          hint: n === 8 ? "Look at the sign between the numbers."
            : n === 9 ? "Count the groups one more time."
            : "Check which number is bigger."
        });
      } else {
        list.push({ n: n, correct: true });
      }
    }
    return list;
  }

  function mockResult(kind, id) {
    if (kind === "retake") {
      return { ok: true, status: "retake", sheet_id: id, stars_earned: 0, balance: 20, mock: true };
    }
    if (kind === "not_homework") {
      return { ok: true, status: "not_homework", sheet_id: id, message: NOT_HOMEWORK, stars_earned: 0, balance: 20, mock: true };
    }
    if (kind === "cap") {
      return {
        ok: true,
        status: "checked",
        sheet_id: id,
        message: DAILY,
        problems: [
          { n: 1, correct: true },
          { n: 2, correct: true },
          { n: 3, correct: false, hint: "Read the question one more time." }
        ],
        stars_earned: 0,
        balance: 40,
        sheet_stars_total: 8,
        sheet_cap: 10,
        daily_remaining: 0,
        mock: true
      };
    }
    if (mockResubmit) {
      return {
        ok: true,
        status: "checked",
        sheet_id: id,
        message: "You got 9 right! +2 ⭐",
        problems: problems(10),
        stars_earned: 2,
        balance: 29,
        sheet_stars_total: 10,
        sheet_cap: 10,
        daily_remaining: 11,
        mock: true
      };
    }
    return {
      ok: true,
      status: "checked",
      sheet_id: id,
      message: "You got 7 right! +7 ⭐",
      problems: problems(8),
      stars_earned: 7,
      balance: 27,
      sheet_stars_total: 7,
      sheet_cap: 10,
      daily_remaining: 13,
      mock: true
    };
  }

  function mockUpload(body) {
    var kind = nextKind();
    try { sessionStorage.setItem("kidsHomework.mockKind", kind); } catch (err) { /* keep going */ }
    if (kind === "duplicate") return { ok: false, error: "duplicate", mock: true };
    mockResubmit = !!(body && body.resubmit_of);
    mockReadyAt = Date.now() + MOCK_READY;
    return { ok: true, sheet_id: "sheet-" + kind, status: "checking", mock: true };
  }

  function mockStatus(body) {
    var kind = kindNow();
    var id = (body && body.sheet_id) || "sheet-mock";
    if (kind === "slow" || kind === "duplicate") return { ok: true, status: "checking", sheet_id: id, mock: true };
    if (!mockReadyAt) mockReadyAt = Date.now() + MOCK_READY;
    if (Date.now() < mockReadyAt) return { ok: true, status: "checking", sheet_id: id, mock: true };
    return mockResult(kind, id);
  }

  function mockList() {
    return {
      ok: true,
      sheets: [
        { date: "2026-09-26", status: "checked", score: "7/10", stars: 7 },
        { date: "2026-09-25", status: "retake", score: "—", stars: 0 },
        { date: "2026-09-24", status: "checking", score: "—", stars: 0 },
        { date: "2026-09-23", status: "not_homework", score: "—", stars: 0 }
      ],
      mock: true
    };
  }

  function send(body) {
    if (!window.KidsStars || !KidsStars.postJson) {
      return Promise.resolve({ ok: false, error: "asleep" });
    }
    return KidsStars.postJson("/kid-homework", body).then(function (res) {
      if (!res || res.error !== "slow_down") return res;
      var seconds = Number(res.retry_after);
      if (!(seconds >= 0)) seconds = 2;
      return wait(seconds * 1000).then(function () {
        return KidsStars.postJson("/kid-homework", body);
      });
    });
  }

  window.HomeworkCheck = {
    mockOn: mockOn,
    slowMock: function () { return kindNow() === "slow"; },
    upload: function (opts) {
      opts = opts || {};
      var body = { action: "upload", image_base64: String(opts.imageBase64 || "") };
      if (opts.resubmitOf) body.resubmit_of = String(opts.resubmitOf);
      if (mockOn()) return Promise.resolve(mockUpload(body));
      return send(body);
    },
    status: function (sheetId) {
      var body = { action: "status", sheet_id: String(sheetId || "") };
      if (mockOn()) return Promise.resolve(mockStatus(body));
      return send(body);
    },
    list: function () {
      if (mockOn()) return Promise.resolve(mockList());
      return send({ action: "list" });
    }
  };
})();
