/*
 * Kids Chat: a floating chat bubble that lets a kid talk to her Grok Bot.
 * Self-contained (loads chat.css from its own folder). No build step, no dependencies.
 *
 * Put this on a page:
 *   <script>window.KIDS_CHAT = { kid: "miriam", botName: "Mirlil", functionsUrl: "https://<ref>.supabase.co/functions/v1" };</script>
 *   <script src="chat/chat.js" defer></script>
 *
 * Options (all optional except kid):
 *   kid            "miriam" | "joyce"
 *   kidName        shown in the passcode screen ("Hi Miriam!")
 *   botName        "Mirlil" / "Sofie"
 *   botEmoji       avatar emoji for the bot
 *   functionsUrl   Supabase Edge Functions base URL. Empty = "chat is sleeping".
 *   theme          "rainbow" or "plain"
 *   colors         { accent, accentDark, kidBubble, kidInk, botBubble, ink, line }
 *   quickReplies   array of short strings shown as big buttons (set [] to hide)
 *   passcodeKeypad true = big number keypad (default), false = text box (for word passcodes)
 *   pollMs         how often to check for replies while the chat is open (default 3000)
 *
 * Security notes: no secret lives in this file. The kid types the family passcode once; the server returns a
 * signed device token (kept in localStorage) that expires. All text is rendered with textContent.
 */
(function () {
  "use strict";
  if (window.__kidsChatLoaded) return;
  window.__kidsChatLoaded = true;

  var user = window.KIDS_CHAT || {};
  var KID = String(user.kid || "").toLowerCase();
  var defaults = {
    kidName: KID ? KID.charAt(0).toUpperCase() + KID.slice(1) : "friend",
    botName: "Bot",
    botEmoji: "🤖",
    functionsUrl: "",
    theme: "plain",
    colors: {},
    quickReplies: ["👋 Hi!", "😂", "❤️", "👍", "🌈", "Tell me a joke!"],
    passcodeKeypad: true,
    pollMs: 3000,
    closedPollMs: 30000,
    thinkingTimeoutMs: 5 * 60 * 1000,
    maxChars: 300
  };
  var cfg = {};
  Object.keys(defaults).forEach(function (k) { cfg[k] = user[k] !== undefined ? user[k] : defaults[k]; });
  cfg.functionsUrl = String(cfg.functionsUrl || "").trim().replace(/\/+$/, "");
  if (cfg.functionsUrl && !/^https:\/\//.test(cfg.functionsUrl) && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(cfg.functionsUrl + "/")) {
    cfg.functionsUrl = ""; // only https (or localhost for testing)
  }

  // ---------------------------------------------------------------------------------------------
  // Styles: load chat.css from next to this script.
  // ---------------------------------------------------------------------------------------------
  var here = (function () {
    var s = document.currentScript;
    if (!s) {
      var all = document.getElementsByTagName("script");
      for (var i = all.length - 1; i >= 0; i--) if (/chat\.js(\?|$)/.test(all[i].src)) { s = all[i]; break; }
    }
    return s && s.src ? s.src.replace(/[^/]*$/, "") : "chat/";
  })();
  if (!document.querySelector('link[href$="chat.css"]')) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = here + "chat.css";
    document.head.appendChild(link);
  }

  // ---------------------------------------------------------------------------------------------
  // Storage
  // ---------------------------------------------------------------------------------------------
  var KEY = "kidsChat." + KID + ".";
  function load(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } }
  function save(k, v) { try { if (v === null) localStorage.removeItem(KEY + k); else localStorage.setItem(KEY + k, v); } catch (e) { /* private mode */ } }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }
  var sessionId = load("session");
  if (!sessionId) { sessionId = uuid(); save("session", sessionId); }
  var token = load("token");

  // ---------------------------------------------------------------------------------------------
  // DOM helpers
  // ---------------------------------------------------------------------------------------------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function button(cls, text, label, onTap) {
    var b = el("button", cls, text);
    b.type = "button";
    if (label) b.setAttribute("aria-label", label);
    b.addEventListener("click", onTap);
    return b;
  }

  var root = el("div", "kc-root kc-theme-" + (cfg.theme === "rainbow" ? "rainbow" : "plain"));
  var c = cfg.colors || {};
  var vars = { accent: "--kc-accent", accentDark: "--kc-accent-dark", kidBubble: "--kc-kid-bg", kidInk: "--kc-kid-ink",
    botBubble: "--kc-bot-bg", ink: "--kc-ink", line: "--kc-line" };
  Object.keys(vars).forEach(function (k) { if (c[k]) root.style.setProperty(vars[k], c[k]); });

  // Floating bubble
  var fab = button("kc-fab", "", "Chat with " + cfg.botName, function () { setOpen(!isOpen); });
  var fabFace = el("span", "kc-fab-face", "💬");
  fabFace.setAttribute("aria-hidden", "true");
  var fabLabel = el("span", "kc-fab-label", "Chat with " + cfg.botName);
  var badge = el("span", "kc-badge", "");
  badge.hidden = true;
  fab.appendChild(fabFace);
  fab.appendChild(fabLabel);
  fab.appendChild(badge);

  // Panel
  var panel = el("section", "kc-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Chat with " + cfg.botName);
  panel.hidden = true;

  var head = el("header", "kc-head");
  var avatar = el("span", "kc-avatar", cfg.botEmoji);
  avatar.setAttribute("aria-hidden", "true");
  var headText = el("div", "kc-head-text");
  var headName = el("div", "kc-head-name", cfg.botName);
  var headSub = el("div", "kc-head-sub", "");
  headText.appendChild(headName);
  headText.appendChild(headSub);
  var closeBtn = button("kc-close", "✕", "Close chat", function () { setOpen(false); });
  head.appendChild(avatar);
  head.appendChild(headText);
  head.appendChild(closeBtn);

  var body = el("div", "kc-body");
  panel.appendChild(head);
  panel.appendChild(body);
  root.appendChild(panel);
  root.appendChild(fab);

  var toast = el("div", "kc-toast", "");
  toast.setAttribute("role", "status");
  toast.hidden = true;
  panel.appendChild(toast);
  var toastTimer = null;
  function showToast(text, ms) {
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, ms || 3500);
  }

  // ---------------------------------------------------------------------------------------------
  // Network
  // ---------------------------------------------------------------------------------------------
  function api(fn, payload, method) {
    var url = cfg.functionsUrl + "/" + fn;
    var opts = { method: method || "POST", headers: {}, cache: "no-store" };
    if (opts.method === "GET") {
      url += "?kid=" + encodeURIComponent(KID);
    } else {
      opts.headers["Content-Type"] = "application/json";
      payload.kid = KID;
      opts.body = JSON.stringify(payload);
    }
    var ctl = window.AbortController ? new AbortController() : null;
    if (ctl) { opts.signal = ctl.signal; setTimeout(function () { ctl.abort(); }, 15000); }
    return fetch(url, opts).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        data = data || {};
        data.status = res.status;
        if (data.token) { token = data.token; save("token", token); }
        return data;
      });
    }, function () { return { status: 0, ok: false, error: "offline" }; });
  }

  // ---------------------------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------------------------
  var isOpen = false;
  var mode = "idle"; // idle | checking | sleeping | nocode | locked | chat
  var messages = []; // {id, direction, text, status, created_at, local?}
  var lastId = 0;
  var pollTimer = null;
  var polling = false;
  var unread = 0;

  function setOpen(open) {
    isOpen = open;
    panel.hidden = !open;
    root.classList.toggle("kc-open", open);
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      unread = 0;
      badge.hidden = true;
      if (mode === "idle" || mode === "sleeping" || mode === "nocode") start();
      else if (mode === "chat") { renderChat(); schedulePoll(0); focusInput(); }
    } else {
      schedulePoll();
    }
  }

  function start() {
    if (!KID || !cfg.functionsUrl) return showSleeping();
    showChecking();
    if (token) {
      mode = "chat";
      messages = []; lastId = 0;
      renderChat();
      return poll(true);
    }
    api("kid-chat-poll", null, "GET").then(function (r) {
      if (r.ok && r.configured && r.passcode_set === false) showAskGrownUp();
      else if (r.ok && r.configured) showLocked();
      else showSleeping();
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Screens
  // ---------------------------------------------------------------------------------------------
  function clearBody() { while (body.firstChild) body.removeChild(body.firstChild); }

  function showChecking() {
    mode = "checking";
    headSub.textContent = "";
    clearBody();
    var box = el("div", "kc-center");
    box.appendChild(el("div", "kc-big-emoji kc-spin", "🌀"));
    box.appendChild(el("p", "kc-center-text", "Waking up " + cfg.botName + "…"));
    body.appendChild(box);
  }

  function showSleeping() {
    mode = "sleeping";
    stopPoll();
    headSub.textContent = "Sleeping";
    clearBody();
    var box = el("div", "kc-center");
    box.appendChild(el("div", "kc-big-emoji kc-float", "😴"));
    box.appendChild(el("p", "kc-center-title", "Chat is sleeping"));
    box.appendChild(el("p", "kc-center-text", cfg.botName + " can't chat right now. Try again later!"));
    box.appendChild(button("kc-btn", "🔄 Try again", null, function () { start(); }));
    body.appendChild(box);
  }

  // No family code has been set up for this kid yet (the server answers "no_passcode_yet").
  function showAskGrownUp() {
    mode = "nocode";
    stopPoll();
    token = null;
    save("token", null);
    headSub.textContent = "Almost ready";
    clearBody();
    var box = el("div", "kc-center");
    box.appendChild(el("div", "kc-big-emoji kc-float", "🔑"));
    box.appendChild(el("p", "kc-center-title", "Ask a grown-up for the code"));
    box.appendChild(el("p", "kc-center-text", cfg.botName + " is almost ready! A grown-up needs to set up the secret family code first."));
    box.appendChild(button("kc-btn", "🔄 Try again", null, function () { start(); }));
    body.appendChild(box);
  }

  function showLocked(message) {
    mode = "locked";
    stopPoll();
    token = null;
    save("token", null);
    headSub.textContent = "Secret code";
    clearBody();
    var box = el("div", "kc-lock");
    box.appendChild(el("div", "kc-big-emoji", "🔐"));
    box.appendChild(el("p", "kc-center-title", "Hi " + cfg.kidName + "!"));
    box.appendChild(el("p", "kc-center-text", "Type the secret family code to chat with " + cfg.botName + "."));
    var err = el("p", "kc-lock-error", message || "");
    err.setAttribute("role", "alert");
    var code = "";
    var submitting = false;

    function submit() {
      if (submitting || code.length < 1) return;
      submitting = true;
      box.classList.add("kc-busy");
      api("kid-chat-send", { passcode: code, session_id: sessionId }).then(function (r) {
        submitting = false;
        box.classList.remove("kc-busy");
        if (r.ok && r.token) {
          mode = "chat";
          messages = []; lastId = 0;
          renderChat();
          poll(true);
          return;
        }
        code = "";
        if (dots) drawDots();
        if (input) input.value = "";
        if (r.error === "no_passcode_yet") return showAskGrownUp();
        if (r.error === "wrong_passcode") err.textContent = "Oops! That's not it. Try again.";
        else if (r.error === "too_many_tries") err.textContent = "Too many tries. Ask a grown-up, or wait a few minutes.";
        else if (r.error === "not_configured" || r.status === 0 || r.status >= 500) return showSleeping();
        else err.textContent = "Hmm, that didn't work. Try again.";
        box.classList.remove("kc-shake");
        void box.offsetWidth;
        box.classList.add("kc-shake");
      });
    }

    var dots = null, input = null;
    function drawDots() {
      dots.textContent = "";
      var n = Math.max(4, code.length);
      for (var i = 0; i < n; i++) dots.appendChild(el("span", "kc-dot" + (i < code.length ? " kc-dot-on" : "")));
    }

    if (cfg.passcodeKeypad) {
      dots = el("div", "kc-dots");
      dots.setAttribute("aria-label", "Code");
      drawDots();
      box.appendChild(dots);
      box.appendChild(err);
      var pad = el("div", "kc-keypad");
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"].forEach(function (k) {
        var cls = "kc-key" + (k === "✓" ? " kc-key-go" : k === "⌫" ? " kc-key-back" : "");
        var label = k === "✓" ? "Done" : k === "⌫" ? "Delete" : k;
        pad.appendChild(button(cls, k, label, function () {
          err.textContent = "";
          if (k === "⌫") code = code.slice(0, -1);
          else if (k === "✓") return submit();
          else if (code.length < 12) code += k;
          drawDots();
        }));
      });
      box.appendChild(pad);
    } else {
      input = el("input", "kc-code-input");
      input.type = "password";
      input.autocomplete = "off";
      input.setAttribute("autocapitalize", "none");
      input.setAttribute("aria-label", "Secret code");
      input.maxLength = 64;
      input.addEventListener("input", function () { code = input.value; err.textContent = ""; });
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
      box.appendChild(input);
      box.appendChild(err);
      box.appendChild(button("kc-btn kc-btn-go", "Let's chat! 🚀", null, submit));
    }
    body.appendChild(box);
  }

  // Chat screen pieces (built once per render)
  var list = null, thinking = null, textarea = null, counter = null, sendBtn = null;

  function renderChat() {
    headSub.textContent = "Online";
    clearBody();
    list = el("div", "kc-list");
    list.setAttribute("aria-live", "polite");
    thinking = el("div", "kc-msg kc-bot kc-thinking");
    var tb = el("div", "kc-bubble");
    tb.appendChild(el("span", "kc-thinking-text", cfg.botName + " is thinking"));
    var dotsWrap = el("span", "kc-typing");
    dotsWrap.appendChild(el("i"));
    dotsWrap.appendChild(el("i"));
    dotsWrap.appendChild(el("i"));
    tb.appendChild(dotsWrap);
    thinking.appendChild(el("span", "kc-msg-avatar", cfg.botEmoji));
    thinking.appendChild(tb);
    thinking.hidden = true;

    var composer = el("div", "kc-composer");
    if (cfg.quickReplies && cfg.quickReplies.length) {
      var quick = el("div", "kc-quick");
      cfg.quickReplies.forEach(function (q) {
        quick.appendChild(button("kc-quick-btn", q, "Send " + q, function () { send(q); }));
      });
      composer.appendChild(quick);
    }
    var row = el("div", "kc-row");
    textarea = el("textarea", "kc-input");
    textarea.rows = 1;
    textarea.maxLength = cfg.maxChars;
    textarea.placeholder = "Type to " + cfg.botName + "…";
    textarea.setAttribute("aria-label", "Message to " + cfg.botName);
    textarea.addEventListener("input", onType);
    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(textarea.value); }
    });
    sendBtn = button("kc-send", "🚀", "Send", function () { send(textarea.value); });
    sendBtn.appendChild(el("span", "kc-send-text", "Send"));
    row.appendChild(textarea);
    row.appendChild(sendBtn);
    counter = el("div", "kc-counter", "");
    composer.appendChild(row);
    composer.appendChild(counter);

    body.appendChild(list);
    body.appendChild(composer);
    drawMessages();
    onType();
  }

  function onType() {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + "px";
    var n = Array.from ? Array.from(textarea.value).length : textarea.value.length;
    counter.textContent = n > cfg.maxChars - 60 ? n + " / " + cfg.maxChars : "";
    sendBtn.disabled = textarea.value.trim().length === 0;
  }

  function focusInput() {
    // Don't pop the iPad keyboard over the conversation automatically; only on desktop-sized pointers.
    if (textarea && window.matchMedia && window.matchMedia("(pointer: fine)").matches) textarea.focus();
  }

  function timeLabel(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function drawMessages() {
    if (!list) return;
    list.textContent = "";
    if (!messages.length) {
      var hello = el("div", "kc-empty");
      hello.appendChild(el("div", "kc-big-emoji kc-float", cfg.botEmoji));
      hello.appendChild(el("p", "kc-center-text", "Say hi to " + cfg.botName + "!"));
      list.appendChild(hello);
    }
    messages.forEach(function (m) {
      var mine = m.direction === "kid";
      var row = el("div", "kc-msg " + (mine ? "kc-kid" : "kc-bot") + (m.local ? " kc-pending" : ""));
      if (!mine) row.appendChild(el("span", "kc-msg-avatar", cfg.botEmoji));
      var bubble = el("div", "kc-bubble", m.text);
      row.appendChild(bubble);
      var meta = el("div", "kc-meta", m.local ? "Sending…" : timeLabel(m.created_at));
      if (mine && m.status === "failed") {
        meta.textContent = "";
        meta.appendChild(button("kc-retry", "⚠️ " + cfg.botName + " didn't get it. Tap to try again", null, function () { resend(m); }));
      }
      var col = el("div", "kc-col");
      col.appendChild(bubble);
      col.appendChild(meta);
      row.appendChild(col);
      list.appendChild(row);
    });
    list.appendChild(thinking);
    thinking.hidden = !isThinking();
    list.scrollTop = list.scrollHeight;
  }

  function isThinking() {
    for (var i = messages.length - 1; i >= 0; i--) {
      var m = messages[i];
      if (m.direction === "bot") return false;
      if (m.direction === "kid") {
        if (m.status === "failed") return false;
        var age = Date.now() - new Date(m.created_at).getTime();
        return m.local || age < cfg.thinkingTimeoutMs;
      }
    }
    return false;
  }

  function merge(incoming) {
    var added = 0;
    incoming.forEach(function (m) {
      if (typeof m.id !== "number") return;
      var existing = null;
      for (var i = 0; i < messages.length; i++) if (messages[i].id === m.id) { existing = messages[i]; break; }
      if (existing) { existing.status = m.status; return; }
      messages.push(m);
      if (m.direction === "bot") added++;
      if (m.id > lastId) lastId = m.id;
    });
    messages.sort(function (a, b) { return (a.local ? 1e15 : a.id) - (b.local ? 1e15 : b.id); });
    return added;
  }

  // ---------------------------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------------------------
  function send(raw) {
    var text = String(raw || "").trim();
    if (!text || mode !== "chat") return;
    var local = { id: "local-" + Date.now(), direction: "kid", text: text, status: "queued", created_at: new Date().toISOString(), local: true };
    messages.push(local);
    if (textarea && textarea.value.trim() === text) { textarea.value = ""; onType(); }
    drawMessages();
    api("kid-chat-send", { token: token, text: text }).then(function (r) {
      messages = messages.filter(function (m) { return m !== local; });
      if (r.ok && r.message) {
        merge([r.message]);
        drawMessages();
        schedulePoll(1500);
        return;
      }
      drawMessages();
      handleError(r, text);
    });
  }

  function resend(m) {
    m.status = "queued";
    m.created_at = new Date().toISOString();
    drawMessages();
    api("kid-chat-send", { token: token, resend_id: m.id }).then(function (r) {
      if (r.ok && r.message) { m.status = r.message.status; drawMessages(); schedulePoll(1500); return; }
      m.status = "failed";
      drawMessages();
      handleError(r);
    });
  }

  function handleError(r, text) {
    if (text && textarea && !textarea.value) { textarea.value = text; onType(); }
    if (r.error === "no_passcode_yet") return showAskGrownUp();
    if (r.status === 401) return showLocked("Please type the secret code again.");
    if (r.error === "not_configured") return showSleeping();
    if (r.error === "slow_down") return showToast("Whoa, slow down! 🐢 Wait a little bit, then try again.");
    if (r.error === "too_long") return showToast("That's a lot of words! Try a shorter message.");
    if (r.error === "empty") return;
    if (r.status === 0) return showToast("Hmm, no internet. Try again in a moment. 📶");
    showToast("Oops, something went wrong. Try again!");
  }

  function poll(first) {
    if (polling || mode !== "chat" || !token) return;
    polling = true;
    var payload = { token: token };
    if (!first && lastId) payload.after_id = lastId;
    api("kid-chat-poll", payload).then(function (r) {
      polling = false;
      if (r.ok && r.messages) {
        var added = merge(r.messages);
        if (isOpen) drawMessages();
        else if (added && !first) { unread += added; badge.textContent = String(unread); badge.hidden = false; }
        if (first && isOpen) focusInput();
      } else if (r.error === "no_passcode_yet") {
        if (isOpen) showAskGrownUp(); else { mode = "idle"; token = null; save("token", null); }
        return;
      } else if (r.status === 401) {
        if (isOpen) showLocked("Please type the secret code again."); else { mode = "idle"; token = null; save("token", null); }
        return;
      } else if (r.error === "not_configured" || (first && r.status === 0)) {
        if (isOpen) showSleeping(); else mode = "idle";
        return;
      }
      schedulePoll();
    });
  }

  function stopPoll() { clearTimeout(pollTimer); pollTimer = null; }
  function schedulePoll(ms) {
    stopPoll();
    if (mode !== "chat" || !token) return;
    var wait = ms !== undefined ? ms : (isOpen ? cfg.pollMs : cfg.closedPollMs);
    pollTimer = setTimeout(function () {
      if (document.visibilityState === "hidden") return schedulePoll();
      poll(false);
    }, wait);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && mode === "chat") schedulePoll(0);
  });

  // Keep the panel above the iPad keyboard.
  if (window.visualViewport) {
    var fit = function () { root.style.setProperty("--kc-vh", window.visualViewport.height + "px"); };
    window.visualViewport.addEventListener("resize", fit);
    fit();
  }

  function mount() {
    document.body.appendChild(root);
    // Returning kid with a saved token: check quietly for replies so the bubble can show a badge.
    if (token && cfg.functionsUrl && KID) { mode = "chat"; poll(true); }
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  // Small hook for tests and for opening the chat from a page button.
  window.KidsChat = { open: function () { setOpen(true); }, close: function () { setOpen(false); } };
})();
