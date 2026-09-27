/* Rainbow Cats
   Miriam's rules:
   - Level 1 has 9 squares. Each next level adds 3 squares.
   - Every square hides a rainbow cat, a rainbow, or nothing.
   - Every board has at least 5 cats. Finding 5 cats wins the level.
   - A new cat is +5. The winning tap also awards a +5 bonus.
   - Tapping a square again does not score again.
   - A rainbow opens a Brain Break, then the same board continues.
   - An empty square costs one cat-food can. Each level starts with 5.
   - Losing all 5 cans ends the level. After the Brain Break, go back one level (never below 1).
   - A Brain Break also runs at the end of every win and loss.
*/
(function (root) {
  "use strict";

  var CAT_GOAL = 5;
  var START_CANS = 5;
  var SAVE_KEY = "miriam-rainbow-cats";
  var RAINBOW_DELAY = 450;
  var LEVEL_END_DELAY = 800;

  var CAT_COLORS = [
    { name: "red", hex: "#ff4d4d" },
    { name: "orange", hex: "#ff9a1f" },
    { name: "yellow", hex: "#ffd60a" },
    { name: "green", hex: "#2ec45a" },
    { name: "blue", hex: "#2f8cff" },
    { name: "indigo", hex: "#5a4cff" },
    { name: "violet", hex: "#b14cff" }
  ];

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, random) {
    var arr = list.slice();
    var i;
    for (i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function clampLevel(level) {
    var n = Math.round(Number(level));
    if (!isFinite(n) || n < 1) return 1;
    return n;
  }

  function clampScore(score) {
    var n = Math.round(Number(score));
    if (!isFinite(n) || n < 0) return 0;
    return n;
  }

  function squareCount(level) {
    return 9 + (clampLevel(level) - 1) * 3;
  }

  function countsFor(level) {
    var total = squareCount(level);
    var cats = total >= CAT_GOAL ? CAT_GOAL : total;
    var rainbows = clampLevel(level) >= 4 ? 2 : 1;
    var space = total - cats;
    if (rainbows > space) rainbows = space;
    if (space >= 2 && rainbows > space - 1) rainbows = space - 1;
    if (rainbows < 0) rainbows = 0;
    return {
      total: total,
      cats: cats,
      rainbows: rainbows,
      empties: total - cats - rainbows
    };
  }

  function makeBoard(level, random) {
    var counts = countsFor(level);
    var colors = shuffle(CAT_COLORS, random);
    var tiles = [];
    var i;

    for (i = 0; i < counts.cats; i++) {
      tiles.push({
        kind: "cat",
        colorName: colors[i % colors.length].name,
        color: colors[i % colors.length].hex,
        revealed: false,
        scored: false
      });
    }
    for (i = 0; i < counts.rainbows; i++) {
      tiles.push({ kind: "rainbow", revealed: false, scored: false });
    }
    for (i = 0; i < counts.empties; i++) {
      tiles.push({ kind: "empty", revealed: false, scored: false });
    }

    var cats = 0;
    for (i = 0; i < tiles.length; i++) {
      if (tiles[i].kind === "cat") cats += 1;
    }
    i = 0;
    while (cats < CAT_GOAL && i < tiles.length) {
      if (tiles[i].kind !== "cat") {
        tiles[i] = {
          kind: "cat",
          colorName: colors[cats % colors.length].name,
          color: colors[cats % colors.length].hex,
          revealed: false,
          scored: false
        };
        cats += 1;
      }
      i += 1;
    }

    return shuffle(tiles, random);
  }

  function createGame(options) {
    options = options || {};
    var random = options.random || Math.random;
    var level = clampLevel(options.level);
    var score = clampScore(options.score);
    var board = [];
    var cans = START_CANS;
    var catsFound = 0;
    var phase = "play";
    var tone = "info";
    var message = "Find all five cats!";

    function begin() {
      cans = START_CANS;
      catsFound = 0;
      phase = "play";
      tone = "info";
      board = makeBoard(level, random);
      message = "Find all five cats!";
    }

    function copyTile(tile) {
      return {
        kind: tile.revealed ? tile.kind : "hidden",
        revealed: !!tile.revealed,
        color: tile.revealed && tile.kind === "cat" ? tile.color : "",
        colorName: tile.revealed && tile.kind === "cat" ? tile.colorName : ""
      };
    }

    function getState() {
      var tiles = [];
      var i;
      for (i = 0; i < board.length; i++) tiles.push(copyTile(board[i]));
      return {
        level: level,
        score: score,
        cans: cans,
        catsFound: catsFound,
        catGoal: CAT_GOAL,
        phase: phase,
        tone: tone,
        message: message,
        tiles: tiles
      };
    }

    function peek() {
      var kinds = [];
      var i;
      for (i = 0; i < board.length; i++) kinds.push(board[i].kind);
      return kinds;
    }

    function tap(index) {
      if (phase !== "play") return { type: "locked" };
      index = Number(index);
      if (!isFinite(index) || index < 0 || index >= board.length) return { type: "locked" };
      var tile = board[index];
      if (tile.revealed) {
        tone = "info";
        if (tile.kind === "cat") message = "You already found that cat!";
        else if (tile.kind === "rainbow") message = "You already found that rainbow!";
        else message = "That square is already empty.";
        return { type: "again", kind: tile.kind };
      }

      tile.revealed = true;

      if (tile.kind === "cat") {
        if (!tile.scored) {
          tile.scored = true;
          score += 5;
          catsFound += 1;
        }
        if (catsFound >= CAT_GOAL) {
          score += 5;
          phase = "win";
          tone = "win";
          message = "All five cats! +5 and a +5 bonus!";
          return { type: "win", level: level };
        }
        tone = "cat";
        message = "A rainbow cat! +5";
        return { type: "cat", level: level };
      }

      if (tile.kind === "rainbow") {
        phase = "rainbow";
        tone = "rainbow";
        message = "A rainbow! Brain break, then back to this level.";
        return { type: "rainbow", level: level };
      }

      cans -= 1;
      if (cans <= 0) {
        cans = 0;
        phase = "lose";
        tone = "lose";
        message = "Oh no! The cat food is all gone.";
        return { type: "lose", level: level };
      }
      tone = "empty";
      message = "Empty! You lost one can of cat food.";
      return { type: "empty", level: level };
    }

    function resume() {
      if (phase !== "rainbow") return getState();
      phase = "play";
      tone = "info";
      message = "Back to the cats! Find the rest.";
      return getState();
    }

    function advance() {
      level += 1;
      begin();
      message = "Level " + level + "! Find all five cats!";
      return getState();
    }

    function retreat() {
      var failed = level;
      if (level > 1) level -= 1;
      begin();
      if (failed <= 1) message = "Level 1 again! Find all five cats!";
      else message = "Back to level " + level + "! Find all five cats!";
      return getState();
    }

    begin();

    return {
      tap: tap,
      resume: resume,
      advance: advance,
      retreat: retreat,
      getState: getState,
      peek: peek
    };
  }

  var api = {
    CAT_GOAL: CAT_GOAL,
    START_CANS: START_CANS,
    squareCount: squareCount,
    countsFor: countsFor,
    makeBoard: makeBoard,
    createGame: createGame,
    mulberry32: mulberry32
  };

  function catSvg() {
    return (
      '<svg viewBox="0 0 100 100" class="art" aria-hidden="true" focusable="false">' +
        '<polygon points="18,42 30,16 42,40" fill="rgba(255,255,255,0.35)" stroke="#3a1d5c" stroke-width="3" stroke-linejoin="round"/>' +
        '<polygon points="82,42 70,16 58,40" fill="rgba(255,255,255,0.35)" stroke="#3a1d5c" stroke-width="3" stroke-linejoin="round"/>' +
        '<polygon points="24,38 30,22 36,38" fill="#ffb3d9"/>' +
        '<polygon points="76,38 70,22 64,38" fill="#ffb3d9"/>' +
        '<ellipse cx="35" cy="50" rx="9" ry="11" fill="#fff" stroke="#3a1d5c" stroke-width="3"/>' +
        '<ellipse cx="65" cy="50" rx="9" ry="11" fill="#fff" stroke="#3a1d5c" stroke-width="3"/>' +
        '<circle cx="37" cy="52" r="4.2" fill="#3a1d5c"/>' +
        '<circle cx="67" cy="52" r="4.2" fill="#3a1d5c"/>' +
        '<circle cx="35.6" cy="50.2" r="1.5" fill="#fff"/>' +
        '<circle cx="65.6" cy="50.2" r="1.5" fill="#fff"/>' +
        '<ellipse cx="50" cy="72" rx="20" ry="14" fill="#fff" stroke="#3a1d5c" stroke-width="3"/>' +
        '<polygon points="50,66 45.5,72 54.5,72" fill="#ff5c93" stroke="#3a1d5c" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M43 76 Q50 83 57 76" fill="none" stroke="#3a1d5c" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M12 64 H32 M14 74 H30 M68 64 H88 M70 74 H86" fill="none" stroke="#3a1d5c" stroke-width="2.5" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function rainbowSvg() {
    return (
      '<svg viewBox="0 0 100 100" class="art" aria-hidden="true" focusable="false">' +
        '<path d="M12 74 A38 38 0 0 1 88 74" fill="none" stroke="#ff4d4d" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M20 74 A30 30 0 0 1 80 74" fill="none" stroke="#ff9a1f" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M28 74 A22 22 0 0 1 72 74" fill="none" stroke="#ffd60a" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M36 74 A14 14 0 0 1 64 74" fill="none" stroke="#2ec45a" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M44 74 A6 6 0 0 1 56 74" fill="none" stroke="#2f8cff" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="20" cy="78" r="11" fill="#fff" stroke="#3a1d5c" stroke-width="3"/>' +
        '<circle cx="80" cy="78" r="11" fill="#fff" stroke="#3a1d5c" stroke-width="3"/>' +
      "</svg>"
    );
  }

  function pawSvg() {
    return (
      '<svg viewBox="0 0 100 100" class="art paw" aria-hidden="true" focusable="false">' +
        '<circle cx="28" cy="38" r="9" fill="#b14cff"/>' +
        '<circle cx="46" cy="28" r="9" fill="#5a4cff"/>' +
        '<circle cx="66" cy="30" r="9" fill="#2f8cff"/>' +
        '<circle cx="80" cy="44" r="8" fill="#2ec45a"/>' +
        '<ellipse cx="52" cy="64" rx="22" ry="18" fill="#ff4d4d"/>' +
      "</svg>"
    );
  }

  function labelFor(tile) {
    if (!tile.revealed) return "Covered square";
    if (tile.kind === "cat") return tile.colorName + " cat, found";
    if (tile.kind === "rainbow") return "Rainbow, found";
    return "Empty square";
  }

  function artFor(tile) {
    if (!tile.revealed) {
      return '<span class="badge">' + pawSvg() + "</span>";
    }
    if (tile.kind === "cat") return catSvg();
    if (tile.kind === "rainbow") return rainbowSvg();
    return '<span class="empty-face" aria-hidden="true">Empty</span>';
  }

  function renderCans(cans) {
    var row = document.getElementById("cans");
    var left = document.getElementById("cans-left");
    if (left) left.textContent = String(cans);
    if (!row) return;
    row.innerHTML = "";
    row.setAttribute("aria-label", cans + " of " + START_CANS + " cat food cans left");
    var i;
    for (i = 0; i < START_CANS; i++) {
      var can = document.createElement("span");
      can.className = "can" + (i < cans ? " full" : " gone");
      can.setAttribute("aria-hidden", "true");
      row.appendChild(can);
    }
  }

  function render(state, justIndex) {
    var scoreEl = document.getElementById("score");
    var levelEl = document.getElementById("level");
    var foundEl = document.getElementById("found");
    var messageEl = document.getElementById("message");
    var grid = document.getElementById("grid");
    if (scoreEl) scoreEl.textContent = String(state.score);
    if (levelEl) levelEl.textContent = String(state.level);
    if (foundEl) foundEl.textContent = "Cats found: " + state.catsFound + " / " + state.catGoal;
    if (messageEl) {
      messageEl.textContent = state.message;
      messageEl.className = "message " + (state.tone || "info");
    }
    renderCans(state.cans);

    if (!grid) return;
    grid.className = "grid" + (state.phase === "play" ? "" : " locked");
    grid.innerHTML = "";
    var i;
    for (i = 0; i < state.tiles.length; i++) {
      var tile = state.tiles[i];
      var button = document.createElement("button");
      button.type = "button";
      button.className = "tile " + (tile.revealed ? tile.kind : "hidden");
      if (tile.revealed && tile.kind === "cat") button.className += " cat-" + tile.colorName;
      if (i === justIndex) button.className += " just-found";
      button.setAttribute("data-index", String(i));
      if (tile.revealed) button.setAttribute("data-kind", tile.kind);
      button.setAttribute("aria-label", labelFor(tile));
      if (state.phase !== "play") button.setAttribute("aria-disabled", "true");
      if (tile.color) button.style.background = tile.color;
      button.innerHTML = artFor(tile);
      grid.appendChild(button);
    }
  }

  function loadProgress() {
    try {
      var data = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
      if (!data || typeof data !== "object") return { level: 1, score: 0 };
      return { level: data.level, score: data.score };
    } catch (err) {
      return { level: 1, score: 0 };
    }
  }

  function saveProgress(state) {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify({
        level: state.level,
        score: state.score
      }));
    } catch (err) {
      /* Private mode can block storage. The game still plays. */
    }
  }

  function randomFromPage() {
    var match = /[?&]seed=(\d+)/.exec(window.location.search || "");
    if (match) return mulberry32(Number(match[1]));
    return Math.random;
  }

  function levelEnd(won, level) {
    var breaks = root.JoyceBrainBreaks;
    if (!breaks || typeof breaks.levelEnd !== "function") {
      return Promise.resolve();
    }
    return breaks.levelEnd({ won: !!won, level: level });
  }

  function mountGame() {
    var grid = document.getElementById("grid");
    if (!grid || grid.getAttribute("data-ready") === "yes") return;
    grid.setAttribute("data-ready", "yes");

    var saved = loadProgress();
    var game = createGame({
      level: saved.level,
      score: saved.score,
      random: randomFromPage()
    });
    if (/[?&]seed=\d+/.test(window.location.search || "")) {
      root.__rainbowCatsTest = game;
    }
    var ticket = 0;

    render(game.getState(), -1);

    function afterBreak(next) {
      var state = next();
      saveProgress(state);
      render(state, -1);
    }

    function openBreak(won, level, delay, next) {
      var mine = ++ticket;
      window.setTimeout(function () {
        if (mine !== ticket) return;
        levelEnd(won, level).then(function () {
          if (mine !== ticket) return;
          afterBreak(next);
        }, function () {
          if (mine !== ticket) return;
          afterBreak(next);
        });
      }, delay);
    }

    function nudgeMessage() {
      var message = document.getElementById("message");
      if (!message || !message.scrollIntoView) return;
      try {
        message.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } catch (err) {
        message.scrollIntoView();
      }
    }

    grid.addEventListener("click", function (event) {
      var node = event.target;
      while (node && node !== grid) {
        if (node.classList && node.classList.contains("tile")) break;
        node = node.parentNode;
      }
      if (!node || node === grid) return;
      var index = Number(node.getAttribute("data-index"));
      var result = game.tap(index);
      var state = game.getState();
      render(state, index);

      if (result.type === "cat" || result.type === "empty") {
        saveProgress(state);
        return;
      }
      if (result.type === "rainbow") {
        nudgeMessage();
        openBreak(true, result.level, RAINBOW_DELAY, function () {
          return game.resume();
        });
        return;
      }
      if (result.type === "win") {
        saveProgress(state);
        nudgeMessage();
        openBreak(true, result.level, LEVEL_END_DELAY, function () {
          return game.advance();
        });
        return;
      }
      if (result.type === "lose") {
        saveProgress(state);
        nudgeMessage();
        openBreak(false, result.level, LEVEL_END_DELAY, function () {
          return game.retreat();
        });
      }
    });
  }

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.RainbowCats = api;

  if (root.document) {
    if (root.document.readyState === "loading") {
      root.document.addEventListener("DOMContentLoaded", mountGame);
    } else {
      mountGame();
    }
  }
})(typeof window !== "undefined" ? window : global);
