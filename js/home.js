// Draws the game cards on Miriam's Rainbow Arcade from the MIRIAM_GAMES list.
(function () {
  var RAINBOW = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
  var list = document.getElementById("game-list");
  var games = (typeof MIRIAM_GAMES !== "undefined" && MIRIAM_GAMES) || [];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function allowed(game) {
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (!feats) return true;
    if (String(game.href || "").indexOf("books/") === 0 && !feats.bookClub) return false;
    if (String(game.href || "").indexOf("homework/") === 0 && !feats.homework) return false;
    return true;
  }

  var shown = games.filter(allowed);

  if (!shown.length) {
    var soon = el("div", "game-card soon-card color-violet");
    soon.setAttribute("role", "status");
    var emoji = el("span", "game-emoji", "🎁");
    emoji.setAttribute("aria-hidden", "true");
    soon.appendChild(emoji);
    soon.appendChild(el("span", "game-title", "Games coming soon!"));
    soon.appendChild(el("span", "game-about", "New rainbow games are on the way. 🌈✨"));
    var stars = el("span", "soon-stars", "⭐ ⭐ ⭐");
    stars.setAttribute("aria-hidden", "true");
    soon.appendChild(stars);
    list.appendChild(soon);
    return;
  }

  shown.forEach(function (game, index) {
    var color = RAINBOW.indexOf(game.color) >= 0 ? game.color : RAINBOW[index % RAINBOW.length];
    var card = el("a", "game-card color-" + color);
    card.href = game.href;

    var emoji = el("span", "game-emoji", game.emoji || "🎮");
    emoji.setAttribute("aria-hidden", "true");

    var aboutText = game.about || "Tap to play!";
    var feats = window.KIDS_SETTINGS && window.KIDS_SETTINGS.features;
    if (feats && !feats.stars && String(game.href || "").indexOf("practice/") === 0) {
      aboutText = "Extra questions at your level.";
    }

    card.appendChild(emoji);
    card.appendChild(el("span", "game-title", game.title));
    card.appendChild(el("span", "game-about", aboutText));
    card.appendChild(el("span", "play-pill", "▶ Play"));
    list.appendChild(card);
  });
})();
