/* Book Club. She picks a finished book, then talks about it in the chat.
   There is no quiz on this page. Copy this folder with client.js. */
(function () {
  var app = document.getElementById("app");
  var cfg = window.KIDS_CHAT || {};
  var botName = cfg.botName || "your guide";
  var busy = false;
  var CHAT_LINE = "Open the chat bubble \uD83D\uDCAC to answer some questions about your book!";
  var ICONS = {
    check: "\uD83D\uDCAC",
    pages_unknown: "\u2753",
    too_short: "\uD83D\uDCD7",
    already_paid: "\uD83C\uDF1F",
    in_progress: "\uD83D\uDCAC",
    tried_twice: "\u270B"
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function button(label, className, onClick) {
    var node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function openChat() {
    var fab = document.querySelector(".kc-fab");
    if (fab) fab.click();
    else if (window.KidsChat && KidsChat.open) KidsChat.open();
  }

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

  function nudgeChat() {
    function go() {
      var fab = document.querySelector(".kc-fab");
      if (fab) fab.classList.add("book-pulse");
      if (window.KidsChat && KidsChat.open) KidsChat.open();
    }
    go();
    window.setTimeout(go, 500);
  }

  function pagesLine(pages) {
    if (typeof pages === "number" && pages > 0) return "about " + pages + " pages";
    return "pages not sure yet";
  }

  function prettyDate(iso) {
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    if (!match) return "";
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month = months[Number(match[2]) - 1];
    if (!month) return "";
    return month + " " + Number(match[3]);
  }

  function shelfLabel(status) {
    var key = String(status || "");
    if (key === "earned" || key === "paid" || key === "already_paid") return "Earned";
    if (key === "waiting" || key === "pending" || key === "pending_review" || key === "review") return "Waiting for a grown-up";
    if (key === "check" || key === "in_progress" || key === "telling" || key === "pages_unknown") return "Telling " + botName;
    if (key === "too_short") return "Too short";
    if (key === "tried_twice") return "Tried twice";
    if (key === "try_again" || key === "failed") return "Try again";
    return "Still checking";
  }

  function starsLine(book) {
    var n = book && book.stars;
    if (typeof n !== "number") n = book && book.stars_earned;
    if (typeof n !== "number" && book && (book.status === "earned" || book.status === "paid" || book.status === "already_paid")) n = 20;
    if (typeof n !== "number") return "";
    return n + " \u2B50";
  }

  function coverEl(url) {
    var wrap = el("div", "book-cover");
    var placeholder = el("span", "book-placeholder", "📖");
    placeholder.setAttribute("aria-hidden", "true");
    wrap.appendChild(placeholder);
    if (url) {
      var img = document.createElement("img");
      img.alt = "";
      img.src = url;
      img.addEventListener("error", function () { img.remove(); });
      wrap.appendChild(img);
    }
    return wrap;
  }

  function fallbackMessage(res) {
    var status = res && res.status;
    var min = (res && res.min_pages) || 50;
    if (status === "check" || status === "pages_unknown") {
      return "Great reading! Now tell " + botName + " about your book in the chat 💬";
    }
    if (status === "too_short") {
      return "This book is shorter than " + min + " pages, so it doesn't earn stars, but reading is always awesome!";
    }
    if (status === "already_paid") return "You already got your stars for this book! 🌟";
    if (status === "in_progress") return "You're already telling " + botName + " about this book, open the chat!";
    if (status === "tried_twice") return "You already tried this book twice. Pick a different one!";
    return "Try another book.";
  }

  function slowText(res) {
    var base = res && res.message ? String(res.message) : "Wait a moment, then try again.";
    var seconds = res && Number(res.retry_after);
    if (!(seconds > 0)) return base;
    if (base.indexOf(String(Math.round(seconds))) !== -1) return base;
    return base.replace(/\s+$/, "") + " Try again in " + Math.round(seconds) + " seconds.";
  }

  function problemText(res) {
    if (!res) return "Book Club is waking up...";
    if (res.error === "slow_down") return slowText(res);
    if (res.message) return String(res.message);
    if (res.error === "locked") return "Ask a grown-up to unlock. Open the chat bubble and enter the family code.";
    if (res.error === "no_passcode_yet") return "Ask a grown-up to set up Book Club.";
    if (res.error === "library_unavailable") return "The library is busy. Try again in a little while.";
    if (res.error === "bad_work_id") return "That book didn't work. Try another one.";
    if (res.error === "book_not_found") return "I couldn't find that book. Try another one.";
    if (res.error === "server_error" || res.error === "not_configured") return "Book Club is napping, try again soon";
    return "Book Club is waking up...";
  }

  function showProblem(res) {
    busy = false;
    var error = res && res.error;
    if (error === "locked" || error === "bad_token" || error === "token_expired") {
      showLocked();
      return;
    }
    if (error === "library_unavailable" || error === "slow_down" || error === "bad_work_id" || error === "book_not_found" || error === "no_passcode_yet") {
      showMessage(problemText(res), error || "message");
      return;
    }
    if (res && res.message) {
      showMessage(String(res.message), error || "message");
      return;
    }
    showAsleep();
  }

  function showMessage(text, screen) {
    app.innerHTML = "";
    app.setAttribute("data-screen", screen || "message");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-note", text));
    speak(text);
    app.appendChild(button("Try again", "book-next", showSearch));
  }

  function showLocked() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "locked");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-note", "Ask a grown-up to unlock. Open the chat bubble and enter the family code."));
    app.appendChild(button("Open the chat", "book-next", openChat));
    app.appendChild(button("Try again", "book-side", showSearch));
  }

  function showAsleep() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "asleep");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-note", "Book Club is waking up..."));
    app.appendChild(button("Try again", "book-next", showSearch));
  }

  function showSearch() {
    busy = false;
    app.innerHTML = "";
    app.setAttribute("data-screen", "search");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-lead", "Read a book. A long one can earn 20 stars."));
    var form = el("form", "book-form");
    var titleLabel = el("label", "book-label", "Book title");
    titleLabel.setAttribute("for", "book-title-input");
    var titleInput = el("input", "book-input");
    titleInput.id = "book-title-input";
    titleInput.type = "text";
    titleInput.autocomplete = "off";
    titleInput.enterKeyHint = "search";
    var authorLabel = el("label", "book-label", "Author, if you know it");
    authorLabel.setAttribute("for", "book-author-input");
    var authorInput = el("input", "book-input");
    authorInput.id = "book-author-input";
    authorInput.type = "text";
    authorInput.autocomplete = "off";
    var find = el("button", "book-next", "Find");
    find.type = "submit";
    var note = el("p", "book-note", "");
    note.setAttribute("data-note", "1");
    form.appendChild(titleLabel);
    form.appendChild(titleInput);
    form.appendChild(authorLabel);
    form.appendChild(authorInput);
    form.appendChild(find);
    form.appendChild(note);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      lookup(titleInput.value, authorInput.value, note, find);
    });
    app.appendChild(form);
    app.appendChild(button("My books", "book-side", showShelf));
  }

  function lookup(title, author, note, find) {
    if (busy) return;
    title = String(title || "").trim();
    author = String(author || "").trim();
    if (!title) {
      note.textContent = "Type the book's name.";
      return;
    }
    busy = true;
    find.disabled = true;
    note.textContent = "Looking...";
    window.KidBooks.lookup(title, author).then(function (res) {
      busy = false;
      if (!res || res.ok === false) {
        showProblem(res);
        return;
      }
      var results = Array.isArray(res.results) ? res.results.slice(0, 5) : [];
      if (!results.length) {
        showSearch();
        var again = document.querySelector("[data-note]");
        if (again) again.textContent = "No book with that name. Try again.";
        var input = document.getElementById("book-title-input");
        if (input) input.value = title;
        return;
      }
      showResults(results);
    });
  }

  function showResults(results) {
    app.innerHTML = "";
    app.setAttribute("data-screen", "results");
    app.appendChild(el("h1", "book-title", "Is it one of these?"));
    var list = el("div", "book-list");
    results.forEach(function (book) {
      var card = el("button", "book-card");
      card.type = "button";
      card.setAttribute("data-work-id", book.work_id || "");
      card.appendChild(coverEl(book.cover_url));
      var text = el("span", "book-card-text");
      text.appendChild(el("span", "book-name", book.title || "A book"));
      text.appendChild(el("span", "book-author", book.author || "Author not sure"));
      text.appendChild(el("span", "book-pages", pagesLine(book.pages)));
      card.appendChild(text);
      card.addEventListener("click", function () { choose(book); });
      list.appendChild(card);
    });
    app.appendChild(list);
    app.appendChild(button("None of these", "book-side", showSearch));
  }

  function choose(book) {
    if (busy) return;
    busy = true;
    app.innerHTML = "";
    app.setAttribute("data-screen", "wait");
    app.appendChild(el("p", "book-lead", "One moment..."));
    window.KidBooks.start(book.work_id).then(function (res) {
      busy = false;
      if (!res || res.ok === false) {
        showProblem(res);
        return;
      }
      showStatus(res, book);
    });
  }

  function showStatus(res, book) {
    var status = res.status || "check";
    app.innerHTML = "";
    app.setAttribute("data-screen", status);
    var icon = el("p", "book-icon", ICONS[status] || "\uD83D\uDCD6");
    icon.setAttribute("aria-hidden", "true");
    app.appendChild(icon);
    app.appendChild(el("h1", "book-title", book && book.title ? book.title : "Your book"));
    var message = res.message ? String(res.message) : fallbackMessage(res);
    app.appendChild(el("p", "book-note", message));
    var spoken = message;
    if (status === "check" || status === "pages_unknown") {
      app.appendChild(el("p", "book-aside", CHAT_LINE));
      spoken = message + " " + CHAT_LINE;
      nudgeChat();
    }
    speak(spoken);
    if (status === "check" || status === "pages_unknown" || status === "in_progress") {
      app.appendChild(button("Open the chat", "book-next", openChat));
    }
    app.appendChild(button("Find another book", "book-side", showSearch));
    app.appendChild(button("My books", "book-side", showShelf));
  }

  function showShelf() {
    if (busy) return;
    busy = true;
    app.innerHTML = "";
    app.setAttribute("data-screen", "shelf-wait");
    app.appendChild(el("p", "book-lead", "Opening your books..."));
    window.KidBooks.list().then(function (res) {
      busy = false;
      if (!res || res.ok === false) {
        showProblem(res);
        return;
      }
      paintShelf(Array.isArray(res.books) ? res.books : []);
    });
  }

  function paintShelf(books) {
    app.innerHTML = "";
    app.setAttribute("data-screen", "shelf");
    app.appendChild(el("h1", "book-title", "My books"));
    if (!books.length) app.appendChild(el("p", "book-lead", "No books yet. Find one you have read."));
    var list = el("div", "book-list");
    books.forEach(function (book) {
      var card = el("article", "book-card book-card-static");
      card.setAttribute("data-status", book.status || "");
      card.appendChild(coverEl(book.cover_url));
      var text = el("span", "book-card-text");
      text.appendChild(el("span", "book-name", book.title || "A book"));
      if (book.author) text.appendChild(el("span", "book-author", book.author));
      if (typeof book.pages === "number" && book.pages > 0) text.appendChild(el("span", "book-pages", pagesLine(book.pages)));
      text.appendChild(el("span", "book-status", shelfLabel(book.status)));
      var stars = starsLine(book);
      if (stars) text.appendChild(el("span", "book-stars", stars));
      var when = prettyDate(book.date);
      if (when) text.appendChild(el("span", "book-date", when));
      if (typeof book.score === "number") text.appendChild(el("span", "book-date", "Score: " + book.score));
      card.appendChild(text);
      list.appendChild(card);
    });
    app.appendChild(list);
    app.appendChild(button("Find a book", "book-next", showSearch));
  }

  function bookClubOn() {
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (feats) return !!feats.bookClub;
    return !!String(cfg.functionsUrl || "");
  }

  function showOff() {
    app.innerHTML = "";
    app.setAttribute("data-screen", "off");
    app.appendChild(el("h1", "book-title", "Book Club"));
    app.appendChild(el("p", "book-lead", "Book Club needs the chat server. The games still work without it."));
    var home = el("a", "home-link", "← Home");
    home.href = "../index.html";
    app.appendChild(home);
  }

  if (!bookClubOn()) showOff();
  else showSearch();
})();
