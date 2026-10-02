/* Shared kid switcher. One file for every kids' site: it injects its own
   styles and marks whichever kid matches this page's host and path.
   Joyce's site can use this same file. No network requests. */
(function () {
  var KIDS = [
    { name: "Joyce", url: "https://joyce.goldberghq.com/" },
    { name: "Mimi", url: "https://mimi.goldberghq.com/" },
    { name: "Bernie", url: "https://joyce.goldberghq.com/bernie/" }
  ];
  var EMOJI = { Joyce: "🕸️", Mimi: "🌈", Bernie: "🐻" };

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function hostOf(url) {
    var match = String(url).match(/^https?:\/\/([^/]+)/i);
    return match ? match[1].toLowerCase() : "";
  }

  function pathOf(url) {
    var match = String(url).match(/^https?:\/\/[^/]+([^?#]*)/i);
    var path = (match && match[1]) || "/";
    if (!path || path.charAt(0) !== "/") path = "/" + path;
    if (path.charAt(path.length - 1) !== "/") path += "/";
    return path;
  }

  function pagePath() {
    var path = String(location.pathname || "/");
    if (path.charAt(path.length - 1) !== "/") path += "/";
    return path;
  }

  /* A kid whose url path is only "/" matches the host. A longer path,
     such as /bernie/ on joyce.goldberghq.com, wins when the page is there. */
  function currentKid() {
    var host = String(location.hostname || "").toLowerCase();
    var path = pagePath();
    var fallback = null;
    var i;
    for (i = 0; i < KIDS.length; i++) {
      if (hostOf(KIDS[i].url) !== host) continue;
      if (pathOf(KIDS[i].url) === "/") {
        if (!fallback) fallback = KIDS[i];
      } else if (path.indexOf(pathOf(KIDS[i].url)) === 0) {
        return KIDS[i];
      }
    }
    return fallback;
  }

  function injectStyle() {
    var css;
    var style;
    if (document.getElementById("kid-switch-style")) return;
    css = [
      ".kids-switch{position:relative;z-index:40;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.2}",
      ".kids-switch-fixed{position:fixed;top:calc(8px + env(safe-area-inset-top));right:calc(8px + env(safe-area-inset-right))}",
      "body.home .wrap{padding-top:64px}",
      "header.quest-top{flex-wrap:wrap}",
      ".quest-top>.kids-switch-bar{order:-1;flex:1 0 100%;display:flex;justify-content:flex-end}",
      "header.top>.kids-switch-bar{justify-self:end}",
      ".kids-switch-btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;min-width:44px;margin:0;padding:6px 12px;border:3px solid #3a1d5c;border-radius:999px;background:#fff;color:#3a1d5c;font:inherit;font-size:18px;font-weight:800;white-space:nowrap;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}",
      ".kids-switch-btn:focus-visible,.kids-switch-menu a:focus-visible{outline:3px solid #2f8cff;outline-offset:2px}",
      ".kids-switch-caret{font-size:14px}",
      ".kids-switch-menu{position:absolute;top:calc(100% + 6px);right:0;z-index:1;min-width:180px;max-width:calc(100vw - 16px - env(safe-area-inset-left) - env(safe-area-inset-right));margin:0;padding:6px;list-style:none;background:#fff;border:3px solid #3a1d5c;border-radius:16px;box-shadow:0 6px 0 #3a1d5c}",
      ".kids-switch-menu[hidden]{display:none}",
      ".kids-switch-menu a{display:flex;align-items:center;gap:8px;min-height:44px;padding:8px 12px;border-radius:12px;color:#3a1d5c;font-size:20px;font-weight:800;text-decoration:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}",
      ".kids-switch-menu a[aria-current='page']{background:#efe6ff;box-shadow:inset 0 0 0 3px #3a1d5c}",
      "@media (max-width:640px){header.top>.kids-switch-bar{order:-1}}"
    ].join("");
    style = document.createElement("style");
    style.id = "kid-switch-style";
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  function build(kid) {
    var root = el("div", "kids-switch");
    var btn = el("button", "kids-switch-btn");
    var menu = el("ul", "kids-switch-menu");
    var open = false;
    var label = kid ? kid.name : "Kids";
    var emoji = el("span", "kids-switch-emoji");
    var name = el("span", "kids-switch-name");
    var caret = el("span", "kids-switch-caret");

    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-controls", "kids-switch-menu");
    btn.setAttribute("aria-label", "Switch kid, " + label);

    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = (kid && EMOJI[kid.name]) || "👧";
    name.textContent = label;
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = "▾";
    btn.appendChild(emoji);
    btn.appendChild(name);
    btn.appendChild(caret);

    menu.id = "kids-switch-menu";
    menu.hidden = true;

    KIDS.forEach(function (item) {
      var li = el("li");
      var link = document.createElement("a");
      var icon = el("span", "kids-switch-emoji");
      link.href = item.url;
      if (kid && item.name === kid.name) link.setAttribute("aria-current", "page");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = EMOJI[item.name] || "";
      link.appendChild(icon);
      link.appendChild(document.createTextNode(item.name));
      li.appendChild(link);
      menu.appendChild(li);
    });

    function setOpen(next) {
      open = next;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
    }

    btn.addEventListener("click", function () {
      setOpen(!open);
    });

    document.addEventListener("click", function (event) {
      if (!open || root.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (!open || event.key !== "Escape") return;
      setOpen(false);
      btn.focus();
    });

    root.appendChild(btn);
    root.appendChild(menu);
    return root;
  }

  function mount() {
    var root;
    var top;
    var slot;
    var kid;
    if (document.querySelector(".kids-switch")) return;
    injectStyle();
    kid = currentKid();
    root = build(kid);
    top = document.querySelector("header.quest-top, header.top");
    if (top) {
      root.classList.add("kids-switch-bar");
      slot = top.querySelector("span:empty");
      if (slot) slot.replaceWith(root);
      else top.insertBefore(root, top.firstChild);
      return;
    }
    root.classList.add("kids-switch-fixed");
    document.body.appendChild(root);
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
