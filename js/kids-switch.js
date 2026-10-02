/* Kid switcher. One menu on every page, jumping to Joyce, Mimi, or Bernie.
   Markup is injected here so pages only add this script and css/kids-switch.css.
   No network requests. */
(function () {
  var KIDS = [
    { name: "Joyce", emoji: "🕸️", href: "https://joyce.goldberghq.com" },
    { name: "Mimi", emoji: "🌈", href: "https://mimi.goldberghq.com", current: true },
    { name: "Bernie", emoji: "🐻", href: "https://joyce.goldberghq.com/bernie/" }
  ];

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function currentKid() {
    var i;
    for (i = 0; i < KIDS.length; i++) if (KIDS[i].current) return KIDS[i];
    return KIDS[0];
  }

  function build() {
    var kid = currentKid();
    var root = el("div", "kids-switch");
    var btn = el("button", "kids-switch-btn");
    var menu = el("ul", "kids-switch-menu");
    var open = false;
    var emoji = el("span", "kids-switch-emoji");
    var name = el("span", "kids-switch-name");
    var caret = el("span", "kids-switch-caret");

    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-controls", "kids-switch-menu");
    btn.setAttribute("aria-label", "Switch kid, " + kid.name);

    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = kid.emoji;
    name.textContent = kid.name;
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
      link.href = item.href;
      if (item.current) link.setAttribute("aria-current", "page");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = item.emoji;
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
    if (document.querySelector(".kids-switch")) return;
    root = build();
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
